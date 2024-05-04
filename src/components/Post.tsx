"use client";

import { formatTimeToNow } from "@/lib/utils";
import type { Post, User, Vote } from "@prisma/client";
import { Loader2, MessageSquare } from "lucide-react";
import { useRef } from "react";
import { PostVoteClient } from "./post-vote/PostVoteClient";
// import { EditorOutput } from "./EditorOutput";
import dynamic from "next/dynamic";

type PartialVote = Pick<Vote, "type">;

const Loading = () => <Loader2 className='ml-56 w-8 h-8 animate-spin' />;

const EditorOutput = dynamic(
  async () => {
    const module = await import("./EditorOutput"); // Adjust the import path accordingly
    return module.EditorOutput;
  },
  {
    ssr: false,
    loading: () => <Loading />, // Specify the Loading Component
  }
);

export function Post({
  subredditName,
  post,
  commentsAmount,
  votesAmt,
  currentVote,
}: {
  subredditName: string;
  post: Post & {
    author: User;
    votes: Vote[];
  };
  commentsAmount: number;
  votesAmt: number;
  currentVote?: PartialVote;
}) {
  const pRef = useRef<HTMLDivElement>(null);
  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-6 py-4 flex justify-between'>
        {/* votes*/}
        <PostVoteClient
          initialVotesAmt={votesAmt}
          postId={post.id}
          initialVote={currentVote?.type}
        />
        <div className='w-0 flex-1'>
          <div className='max-h-40 mt-1 text-xs text-gray-500'>
            {subredditName && (
              <>
                <a
                  className='underline text-zinc-900 text-sm underline-offset-2'
                  href={`/r/${subredditName}`}
                >
                  r/{subredditName}
                </a>
                <span className='px-1'>*</span>
              </>
            )}
            <span>Posted by u/{post.author.name}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
              {post.title}
            </h1>
          </a>
          <div
            className='relative text-sm max-h-40 w-full overflow-clip'
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent' />
            ) : null}
          </div>
        </div>
      </div>
      <div className='bg-gray-100 z-index-20 text-sm p-4 sm:px-6 '>
        <a
          className='w-fit flex items-center gap-2'
          href={`/r/${subredditName}/post/${post.id}`}
        >
          <MessageSquare className='w-4 h-4' /> {commentsAmount} comments
        </a>
      </div>
    </div>
  );
}
