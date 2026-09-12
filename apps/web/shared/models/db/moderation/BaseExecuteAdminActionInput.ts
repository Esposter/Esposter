import type { RoomInMessage, User } from "@esposter/db-schema";

import { roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface BaseExecuteAdminActionInput {
  roomId: RoomInMessage["id"];
  targetUserId: User["id"];
}

export const baseExecuteAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserSchema.shape.id,
}) satisfies z.ZodType<BaseExecuteAdminActionInput>;
