import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourcesRelation = defineRelationsPart(schema, (r) => ({
  resources: {
    publication: r.one.resourcePublications({
      from: r.resources.id,
      optional: true,
      to: r.resourcePublications.resourceId,
    }),
    user: r.one.users({
      from: r.resources.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
