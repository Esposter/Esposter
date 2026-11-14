import type { PublicUser, UserToRoomInMessage } from "@esposter/db-schema";

import { selectUserInAuthSchema, selectUserToRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface Typing extends Pick<UserToRoomInMessage, "roomId" | "userId"> {
  // The name the room knows the typist by, resolved by the server from the typist's own row
  username: PublicUser["name"];
}

export const typingSchema = z.object({
  ...selectUserToRoomInMessageSchema.pick({ roomId: true, userId: true }).shape,
  username: selectUserInAuthSchema.shape.name,
}) satisfies z.ZodType<Typing>;
