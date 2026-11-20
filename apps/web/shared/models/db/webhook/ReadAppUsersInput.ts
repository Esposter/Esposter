import { roomIdSchema, selectAppUserInMessageSchema } from "@esposter/db-schema";
import { createIdBatchSchema } from "@esposter/shared";
import { z } from "zod";

export const readAppUsersInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: createIdBatchSchema(selectAppUserInMessageSchema.shape.id),
});
export type ReadAppUsersInput = z.infer<typeof readAppUsersInputSchema>;
