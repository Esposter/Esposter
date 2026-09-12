import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userSettingsInMessageRelation = defineRelationsPart(schema, (r) => ({
  userSettingsInMessage: {
    user: r.one.users({
      from: r.userSettingsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
