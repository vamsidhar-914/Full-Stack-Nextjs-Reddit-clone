import { INFINITE_SCROLLING_PAGINATON_RESULTS } from "@/config";
import { db } from "@/lib/db";
import { PostFeed } from "./PostFeed";
import { getAuthSession } from "@/lib/auth";
import { Session } from "@prisma/client";
import { cache } from "@/lib/cache";
import { revalidatePath } from "next/cache";

const getGeneralFeed = cache(
  async () => {
    await wait(2000);
    return db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        votes: true,
        author: true,
        comments: true,
        subreddit: true,
      },
      take: INFINITE_SCROLLING_PAGINATON_RESULTS,
    });
  },
  ["/", "getGeneralPostsData"],
  { revalidate: 60 * 60 * 24 }
);

export async function GeneralFeed() {
  const posts = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATON_RESULTS,
  });
  return <PostFeed initialPosts={posts} />;
}

export async function CustomFeed() {
  const session = await getAuthSession();
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  });
  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map(({ subreddit }) => subreddit.id),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATON_RESULTS,
  });
  console.log(posts.length);
  if (posts.length === 0)
    return <p>There are no posts to see,You are not following anyone</p>;

  return <PostFeed initialPosts={posts} />;
}

function wait(duration: number) {
  return new Promise((res) => setTimeout(res, duration));
}
