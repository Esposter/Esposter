import type { z } from "zod";

import { selectPostInPostSchema } from "@esposter/db-schema";

// The posts one read of their counts covers, so a batch the client marks as changed stays one bounded statement
const MAX_POST_COUNTS_PER_READ = 100;

export const readPostCountsInputSchema = selectPostInPostSchema.shape.id.array().min(1).max(MAX_POST_COUNTS_PER_READ);
export type ReadPostCountsInput = z.infer<typeof readPostCountsInputSchema>;
