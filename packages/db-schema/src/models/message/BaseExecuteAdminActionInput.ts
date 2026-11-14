import type { PublicUser } from "#src/models/user/PublicUser";
import type { RoomInMessage } from "#src/schema/message/roomsInMessage";

import { roomIdSchema } from "#src/models/shared/RoomId";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { z } from "zod";

export interface BaseExecuteAdminActionInput {
  roomId: RoomInMessage["id"];
  targetUserId: PublicUser["id"];
}

export const baseExecuteAdminActionInputSchema = z.object({
  ...roomIdSchema.shape,
  targetUserId: selectUserInAuthSchema.shape.id,
}) satisfies z.ZodType<BaseExecuteAdminActionInput>;
