"use client";

import { useRef, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import { CommentVotes } from "./CommentVote";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useMutation } from "@tanstack/react-query";
import {
  CommentValidator,
  commentsVoteValidator,
  createCommentValidator,
} from "@/lib/validators/posts";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

type PartialVote = Pick<CommentVote, "type">;

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  currentVote: CommentVote | undefined;
  currentvotesAmt: number;
  postId: string;
}

export function PostComment({
  comment,
  currentVote,
  currentvotesAmt,
  postId,
}: PostCommentProps) {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setisReplying] = useState<boolean>(false);
  const [value, setValue] = useState("");

  const { mutate: postComment, isPending } = useMutation({
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
    onError: () => {
      return toast({
        title: "something went wrong",
        description: "comment registered failed",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setisReplying(false);
    },
  });

  return (
    <div
      ref={commentRef}
      className='flex flex-col'
    >
      <div className='flex items-center'>
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className='h-6 w-6'
        />
        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>
            u/{comment.author.username}
          </p>

          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className='text-sm text-zinc-900 mt-2'>{comment.text}</p>
      <div className='flex gap-2 items-center flex-wrap'>
        <CommentVotes
          commentId={comment.id}
          initialVote={currentVote}
          initialVotesAmt={currentvotesAmt}
        />
        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setisReplying(true);
          }}
          variant='ghost'
          size='xs'
        >
          <MessageSquare className='h-4 w-4 mr-1.5' />
          Reply
        </Button>

        {isReplying && (
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
              <div className='mt-2 flex justify-end gap-3'>
                <Button
                  tabIndex={-1}
                  variant='subtle'
                  onClick={() => setisReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isPending}
                  disabled={value.length === 0}
                  onClick={() => {
                    if (!value) return;
                    postComment({
                      postId,
                      text: value,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
