import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";
import type { UserToRoomInMessage } from "@/schema/usersToRoomsInMessage";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomsInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.usersToRoomsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.usersToRoomsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;
export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { roomInMessage: RoomInMessage; user: User };
