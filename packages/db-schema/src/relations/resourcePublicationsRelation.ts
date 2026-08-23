import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourcePublicationsRelation = defineRelationsPart(schema, (r) => ({
  resourcePublications: {
    resource: r.one.resources({
      from: r.resourcePublications.resourceId,
      optional: false,
      to: r.resources.id,
    }),
  },
}));
