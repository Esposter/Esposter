import type { z } from "zod";

import { selectPostSchema } from "@esposter/db";

export const deletePostInputSchema = selectPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;
