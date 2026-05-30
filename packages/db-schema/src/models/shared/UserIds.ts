import { MAX_READ_LIMIT } from "@esposter/shared";
import { selectUserSchema } from "@/schema/users";
import { z } from "zod";

export const userIdsSchema = z.object({
  userIds: selectUserSchema.shape.id.array().max(MAX_READ_LIMIT),
});
