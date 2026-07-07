import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourcesRelation = defineRelationsPart(schema, (r) => ({
  resources: {
    user: r.one.users({
      from: r.resources.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
