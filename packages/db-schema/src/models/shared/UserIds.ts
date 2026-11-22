import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { createUniquePrimitiveArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const userIdsSchema = z.object({
  userIds: createUniquePrimitiveArraySchema(selectUserInAuthSchema.shape.id).max(MAX_READ_LIMIT),
});
