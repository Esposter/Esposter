import type { z } from "zod";

import { userIdsSchema } from "@esposter/db-schema";

export const createDirectMessageInputSchema = userIdsSchema.shape.userIds.min(1);
export type CreateDirectMessageInput = z.infer<typeof createDirectMessageInputSchema>;
