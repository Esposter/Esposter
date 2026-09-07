import type { z } from "zod";

import { selectPostSchema } from "@esposter/db-schema";

export const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;
