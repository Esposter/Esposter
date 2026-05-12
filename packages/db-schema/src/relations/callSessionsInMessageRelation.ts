import type { CallSessionInMessage } from "@/schema/callSessionsInMessage";
import type { RoomInMessage } from "@/schema/roomsInMessage";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const callSessionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  callSessionsInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.callSessionsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
  },
}));

export type CallSessionInMessageWithRelations = CallSessionInMessage & {
  roomInMessage: RoomInMessage;
};
