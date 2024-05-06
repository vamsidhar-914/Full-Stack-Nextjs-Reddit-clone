// import { EditorOutput } from "@/components/EditorOutput";
import { PostVoteServer } from "@/components/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getAuthSession } from "@/lib/auth";
import { PostComment } from "@/components/PostComment";
import { CommentsSection } from "@/components/CommentsSection";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

const Loading = () => <Loader2 className=' ml-3 w-8 h-8 animate-spin' />;

const EditorOutput = dynamic(
  async () => {
    const module = await import("@/components/EditorOutput");
    return module.EditorOutput;
  },
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default async function page({
  params: { postid },
}: {
  params: { postid: string };
}) {
  const cachedPost = (await redis.hgetall(`post:${postid}`)) as CachedPost;

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: postid,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }
  if (!post && !cachedPost) return notFound();
  return (
    <div className=''>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postid={post?.id ?? cachedPost.id}
            getData={async () => {
              return await db.post.findUnique({
                where: {
                  id: postid,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className='sm:w-0 w-full flex-1 bg:white p-4 rounded-sm'>
          <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
            {post?.title ?? cachedPost.title}
          </h1>
          <EditorOutput content={post?.content ?? cachedPost.content} />

          <Suspense fallback={<Loader2 className='h-5 2-5 animate-spin' />}>
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostVoteShell() {
  return (
    <div className='flex items-center flex-col pr-6 s-20'>
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className='h-5 w-5 text-zinc-700' />
      </div>
      <div className='text-center py-2 font-meduum text-sm text-zinc-900'>
        <Loader2 className='h-3 w-3 animate-spin' />
      </div>
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  );
}
