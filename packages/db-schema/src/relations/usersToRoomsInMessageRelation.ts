import type { RoomInMessage } from "#src/schema/roomsInMessage";
import type { User } from "#src/schema/users";
import type { UserToRoomInMessage } from "#src/schema/usersToRoomsInMessage";

import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomsInMessage: {
    room: r.one.roomsInMessage({
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

export const UserToRoomInMessageRelations = {
  room: true,
  user: true,
} as const;

export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { room: RoomInMessage; user: User };
