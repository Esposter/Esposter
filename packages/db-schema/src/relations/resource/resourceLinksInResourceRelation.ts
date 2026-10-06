import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceLinksInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceLinksInResource: {
    source: r.one.resourcesInResource({
      from: r.resourceLinksInResource.sourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
