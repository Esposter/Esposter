import { roomIdSchema, selectAppUserInMessageSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readAppUsersInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: createUniqueArraySchema(selectAppUserInMessageSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
export type ReadAppUsersInput = z.infer<typeof readAppUsersInputSchema>;
