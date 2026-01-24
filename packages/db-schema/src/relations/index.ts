import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

const relations = defineRelationsPart(schema, (r) => ({
  userStatusesInMessage: {
    user: r.one.users({
      from: r.userStatusesInMessage.userId,
      to: r.users.id,
    }),
  },
  webhooksInMessage: {
    appUsersInMessage: r.one.appUsersInMessage({
      from: r.webhooksInMessage.userId,
      to: r.appUsersInMessage.id,
    }),
    roomsInMessage: r.one.roomsInMessage({
      from: r.webhooksInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.webhooksInMessage.creatorId,
      to: r.users.id,
    }),
  },
}));
