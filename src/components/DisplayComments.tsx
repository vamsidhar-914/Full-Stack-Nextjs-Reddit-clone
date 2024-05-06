"use client";

import { getAuthSession } from "@/lib/auth";
import { Comment, CommentVote, User, Vote, VoteType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getSession } from "next-auth/react";
import { PostComment } from "./PostComment";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment[];
}

export function DisplayComments({ postId }: { postId: string }) {
  const session = getSession();

  const { data: comments, isPending } = useQuery({
    queryKey: ["postsComments"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/comments?postId=${postId}`);
      return data as PostCommentProps;
    },
  });

  if (isPending) return <p>Loading...</p>;

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      {comments?.comment
        .filter((comment) => !comment.replyToId)
        .map((topLevelComment) => {
          const topLevelCommentsAmt = topLevelComment.votes.reduce(
            (acc, vote) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            },
            0
          );

          const toplevelCommentvotesAmt = topLevelComment.votes.find(
            (vote) => vote.userId === session?.user.id
          );
          return (
            <div
              key={topLevelComment.id}
              className='flex flex-col'
            >
              <div className='mb-2'>
                <PostComment comment={topLevelComment} />
              </div>
            </div>
          );
        })}
    </div>
  );
}
