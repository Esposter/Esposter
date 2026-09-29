import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const userIdsSchema = z.object({
  userIds: createUniqueArraySchema(selectUserInAuthSchema.shape.id).max(MAX_READ_LIMIT),
});
