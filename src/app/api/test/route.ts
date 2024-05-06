import { db } from "@/lib/db";

export async function GET(req: Response) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit");

  try {
    const posts = await db.post.findMany({
      take: parseInt(limit!),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        author: true,
        votes: true,
        comments: true,
      },
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {}
}
