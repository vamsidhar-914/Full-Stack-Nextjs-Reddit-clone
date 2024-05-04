import { db } from "@/lib/db";
import { Post } from "./Post";
import { Vote } from "@prisma/client";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export async function PostFeedServer({ postid }: { postid: string }) {
  const session = await getAuthSession();
  const post = await db.post.findUnique({
    where: {
      id: postid,
    },
    include: {
      subreddit: true,
      votes: true,
      author: true,
      comments: true,
    },
  });

  if (post == null) return notFound();
  const votesAmt = post.votes.reduce((acc, vote) => {
    if (vote.type === "UP") return acc + 1;
    if (vote.type === "DOWN") return acc - 1;
    return acc;
  }, 0);
  const currentVote = post.votes.find(
    (vote) => vote.userId === session?.user.id
  );
  return (
    <Post
      subredditName={post.subreddit.name}
      post={post}
      commentsAmount={post.comments.length}
      votesAmt={votesAmt}
      currentVote={currentVote}
    />
  );
}

// these are the props that should go in to the post
{
  /* <Post 
    subredditName: string;
    post: Post & {
      author: User;
      votes: Vote[];
    };
    commentsAmount: number;
    votesAmt: number;
    currentVote?: PartialVote;
/> */
}
