"use client";

import { toast, useToast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { VoteType } from "@prisma/client";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePrevious } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { PostvotesValidator } from "@/lib/validators/posts";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export function PostVoteClient({
  postId,
  initialVotesAmt,
  initialVote,
}: {
  postId: string;
  initialVotesAmt: number;
  initialVote: VoteType | undefined;
}) {
  const { loginToast } = useCustomToast();
  const [votesAmount, setAmountsVote] = useState(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previous = usePrevious(currentVote);
  const router = useRouter();

  useEffect(() => {
    setCurrentVote(initialVote);
  }, []);

  // voting functionality
  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostvotesValidator = {
        postId,
        voteType: type,
      };
      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setAmountsVote((prev) => prev - 1);
      else setAmountsVote((prev) => prev + 1);

      // reset current this.state.set
      setCurrentVote(previous);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "something went wrong",
        description: "couldnt register your vote,please try agin later",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === "UP") setAmountsVote((prev) => prev - 1);
        else if (type === "DOWN") setAmountsVote((prev) => prev + 1);
      } else {
        setCurrentVote(type);
        if (type === "UP")
          setAmountsVote((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setAmountsVote((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
      <Button
        onClick={() => vote("UP")}
        size='sm'
        variant='ghost'
        aria-label='upvote'
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500 ": currentVote === "UP",
          })}
        />
      </Button>
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>
        {votesAmount}
      </p>
      <Button
        onClick={() => vote("DOWN")}
        size='sm'
        variant='ghost'
        aria-label='downVote'
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500 ": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
}
