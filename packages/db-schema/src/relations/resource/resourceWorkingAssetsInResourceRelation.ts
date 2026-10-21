import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceWorkingAssetsInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceWorkingAssetsInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourceWorkingAssetsInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
