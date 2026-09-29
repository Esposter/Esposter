import type { z } from "zod";

import { selectPostInPostSchema } from "@esposter/db-schema";

export const deletePostInputSchema = selectPostInPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;
