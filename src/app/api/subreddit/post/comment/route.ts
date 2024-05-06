import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommentValidator } from "@/lib/validators/posts";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = createCommentValidator.parse(body);
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("authentication required", { status: 401 });
    }
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });
    return new Response("Successfully created");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", { status: 422 });
    }
    return new Response(
      "could not able to create comment right now,please try again",
      { status: 500 }
    );
  }
}
