import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourcePublicationsInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourcePublicationsInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourcePublicationsInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
