import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { postId } = z
      .object({
        postId: z.string(),
      })
      .parse({
        postId: url.searchParams.get("postId"),
      });
    const comments = await db.comment.findMany({
      where: {
        postId,
        replyToId: null,
      },
      include: {
        votes: true,
        author: true,
        replies: {
          include: {
            author: true,
            votes: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(comments));
  } catch (error) {
    return new Response("something went wrong", { status: 500 });
  }
}
