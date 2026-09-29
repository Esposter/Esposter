import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceVersionsInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceVersionsInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourceVersionsInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
