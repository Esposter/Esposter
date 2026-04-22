import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMemberRolesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadMemberRolesInput = z.infer<typeof readMemberRolesInputSchema>;
