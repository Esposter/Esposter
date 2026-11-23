import { roomIdSchema, userIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readUsersByIdsInputSchema = z.object({ ...roomIdSchema.shape, userIds: userIdsSchema.shape.userIds });
export type ReadUsersByIdsInput = z.infer<typeof readUsersByIdsInputSchema>;
