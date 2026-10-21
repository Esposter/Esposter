import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceVersionAssetsInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceVersionAssetsInResource: {
    resourceVersion: r.one.resourceVersionsInResource({
      from: [
        r.resourceVersionAssetsInResource.resourceId,
        r.resourceVersionAssetsInResource.channel,
        r.resourceVersionAssetsInResource.version,
      ],
      optional: false,
      to: [
        r.resourceVersionsInResource.resourceId,
        r.resourceVersionsInResource.channel,
        r.resourceVersionsInResource.version,
      ],
    }),
  },
}));
