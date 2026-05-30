import type { z } from "zod";

import { MAX_READ_LIMIT } from "@esposter/shared";
import { selectUserSchema } from "@esposter/db-schema";

export const createDirectMessageInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type CreateDirectMessageInput = z.infer<typeof createDirectMessageInputSchema>;
