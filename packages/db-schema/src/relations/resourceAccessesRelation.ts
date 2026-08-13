import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceAccessesRelation = defineRelationsPart(schema, (r) => ({
  resourceAccesses: {
    resource: r.one.resources({
      from: r.resourceAccesses.resourceId,
      optional: false,
      to: r.resources.id,
    }),
    user: r.one.users({
      from: r.resourceAccesses.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
