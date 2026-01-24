import type { InviteInMessage } from "@/schema/invitesInMessage";
import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";
import type { UserToRoomInMessage } from "@/schema/usersToRoomsInMessage";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const invitesInMessageRelation = defineRelationsPart(schema, (r) => ({
  invitesInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.invitesInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.invitesInMessage.userId,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteInMessageRelations = {
  roomInMessage: {
    with: {
      usersToRoomsInMessage: true,
    },
  },
  user: true,
} as const;
export type InviteInMessageWithRelations = InviteInMessage & {
  roomInMessage: RoomInMessage & { usersToRoomsInMessage: UserToRoomInMessage[] };
  user: User;
};
