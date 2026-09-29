import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userSettingsInMessageRelation = defineRelationsPart(schema, (r) => ({
  userSettingsInMessage: {
    user: r.one.usersInAuth({ from: r.userSettingsInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
