"use client";

import { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentValidator } from "@/lib/validators/posts";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/useCustomToast";
import { title } from "process";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function CreateComment({
  postId,
  replyToId,
}: {
  postId: string;
  replyToId?: string;
}) {
  const [value, setValue] = useState("");
  const { loginToast } = useCustomToast();
  const router = useRouter();

  // logic for creating posts
  const { mutate: Comment, isPending } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentValidator) => {
      const payload: CommentValidator = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "there was a problem",
        description: "something went wrong,please try again later",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setValue("");
    },
  });

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your comment</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
          placeholder='what are your thoughts'
        />
        <div className='mt-2 flex justify-end'>
          <Button
            isLoading={isPending}
            disabled={value.length === 0}
            onClick={() => Comment({ postId, text: value, replyToId })}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
