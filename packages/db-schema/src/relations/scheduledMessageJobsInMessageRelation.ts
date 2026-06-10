import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const scheduledMessageJobsInMessageRelation = defineRelationsPart(schema, (r) => ({
  scheduledMessageJobsInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.scheduledMessageJobsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.scheduledMessageJobsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
