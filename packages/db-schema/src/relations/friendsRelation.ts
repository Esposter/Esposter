import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendsRelation = defineRelationsPart(schema, (r) => ({
  friends: {
    receiver: r.one.users({
      from: r.friends.receiverId,
      optional: false,
      to: r.users.id,
    }),
    sender: r.one.users({
      from: r.friends.senderId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
