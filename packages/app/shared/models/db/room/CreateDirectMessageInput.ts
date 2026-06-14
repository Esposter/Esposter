import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";

export const createDirectMessageInputSchema = createUniqueArraySchema(selectUserSchema.shape.id)
  .min(1)
  .max(MAX_READ_LIMIT);
export type CreateDirectMessageInput = z.infer<typeof createDirectMessageInputSchema>;
