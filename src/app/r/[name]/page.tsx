import { MiniCreatePost } from "@/components/MiniCreatePost";
import { INFINITE_SCROLLING_PAGINATON_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function subredditDetail({
  params: { name },
}: {
  params: { name: string };
}) {
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATON_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <div>
      <h1 className='font-bold text-3xl md:text-4xxl h-14'>
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      {/* TODO: show posts in user feed */}
    </div>
  );
}
