import type { z } from "zod";

import { selectPostInPostSchema } from "@esposter/db-schema";

export const readPostInputSchema = selectPostInPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;
