import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { getSession } from "next-auth/react";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("authorization required", { status: 401 });
    }
    const body = await req.json();
    const { name } = UsernameValidator.parse(body);
    const username = await db.user.findFirst({
      where: {
        username: name,
      },
    });
    if (username) {
      return new Response("username is taken", { status: 409 });
    }
    // update
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });
    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid data passes", { status: 422 });
    }
    return new Response("something went wrong", { status: 500 });
  }
}
