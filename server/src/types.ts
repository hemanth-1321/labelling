import { z } from "zod";

export const createTask = z.object({
  options: z
    .array(
      z.object({
        image_url: z.string(),
      })
    )
    .optional(),
  title: z.string().optional(),
  signature: z.string(),
});
