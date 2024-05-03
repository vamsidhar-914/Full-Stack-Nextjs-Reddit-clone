import { z } from "zod";

export const postsValidator = z.object({
  title: z
    .string()
    .min(3, { message: "title must be longer than 3 char." })
    .max(128, { message: "title must be at least 128 char long" }),
  subredditId: z.string(),
  content: z.any(),
});

export const postvotesValidator = z.object({
  postId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export const commentsVoteValidator = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type PostCreationRequest = z.infer<typeof postsValidator>;
export type PostvotesValidator = z.infer<typeof postvotesValidator>;
