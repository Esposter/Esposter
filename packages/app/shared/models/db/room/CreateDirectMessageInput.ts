import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";

export const createDirectMessageInputSchema = selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type CreateDirectMessageInput = z.infer<typeof createDirectMessageInputSchema>;
