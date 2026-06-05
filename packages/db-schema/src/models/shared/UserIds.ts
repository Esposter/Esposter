import { selectUserSchema } from "@/schema/users";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const userIdsSchema = z.object({
  userIds: createUniqueArraySchema(selectUserSchema.shape.id).max(MAX_READ_LIMIT),
});
