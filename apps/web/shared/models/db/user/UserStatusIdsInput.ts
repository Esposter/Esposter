import type { z } from "zod";

import { userIdsSchema } from "@esposter/db-schema";

export const userStatusIdsInputSchema = userIdsSchema.shape.userIds.min(1);
export type UserStatusIdsInput = z.infer<typeof userStatusIdsInputSchema>;
