import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendsInSocialRelation = defineRelationsPart(schema, (r) => ({
  friendsInSocial: {
    receiver: r.one.usersInAuth({ from: r.friendsInSocial.receiverId, optional: false, to: r.usersInAuth.id }),
    sender: r.one.usersInAuth({ from: r.friendsInSocial.senderId, optional: false, to: r.usersInAuth.id }),
  },
}));
