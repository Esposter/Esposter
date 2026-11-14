import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceViewsInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceViewsInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourceViewsInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
