import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceVersionsRelation = defineRelationsPart(schema, (r) => ({
  resourceVersions: {
    resource: r.one.resources({
      from: r.resourceVersions.resourceId,
      optional: false,
      to: r.resources.id,
    }),
  },
}));
