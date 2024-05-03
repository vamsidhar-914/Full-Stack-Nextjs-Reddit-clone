import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubsciptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { subredditId } = SubredditSubsciptionValidator.parse(body);
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });
    if (!subscriptionExists) {
      return new Response("You are not Subscribed to this subreddit", {
        status: 400,
      });
    }
    // check if user is the creator of the subreddit
    const CreatorSubreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });
    if (CreatorSubreddit) {
      return new Response(
        "You are the creator of this subreddit,cant perform action",
        { status: 400 }
      );
    }
    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    });
    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Somethig went wrong,please try again later", {
      status: 500,
    });
  }
}
