import type { PublicUser } from "#src/models/user/PublicUser";
import type { UserToRoomInMessage } from "#src/schema/message/usersToRoomsInMessage";

import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectUserToRoomInMessageSchema } from "#src/schema/message/usersToRoomsInMessage";
import { z } from "zod";

export interface Typing extends Pick<UserToRoomInMessage, "roomId" | "userId"> {
  // The name the room knows the typist by, resolved by the server from the typist's own row
  username: PublicUser["name"];
}

export const typingSchema = z.object({
  ...selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }).shape,
  username: selectUserInAuthSchema.shape.name,
}) satisfies z.ZodType<Typing>;
