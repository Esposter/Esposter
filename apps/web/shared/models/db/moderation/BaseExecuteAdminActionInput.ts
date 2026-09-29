import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { roomIdSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface BaseExecuteAdminActionInput {
  roomId: RoomInMessage["id"];
  targetUserId: PublicUser["id"];
}

export const baseExecuteAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserInAuthSchema.shape.id,
}) satisfies z.ZodType<BaseExecuteAdminActionInput>;
