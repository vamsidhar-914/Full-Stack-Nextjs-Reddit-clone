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
    if (subscriptionExists) {
      return new Response("You already subscribed to this subreddti", {
        status: 400,
      });
    }
    await db.subscription.create({
      data: {
        subredditId,
        userId: session.user.id,
      },
    });
    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid request data passed", { status: 422 });
    }
    return new Response("sorry,Something went wrong,please try again later", {
      status: 500,
    });
  }
}
