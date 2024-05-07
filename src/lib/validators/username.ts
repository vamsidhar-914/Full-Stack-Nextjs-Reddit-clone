import { z } from "zod";

export const UsernameValidator = z.object({
  name: z
    .string()
    .min(3)
    .max(23)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export type UsernameValid = z.infer<typeof UsernameValidator>;
