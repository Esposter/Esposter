import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceAccessesInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceAccessesInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourceAccessesInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
    user: r.one.usersInAuth({ from: r.resourceAccessesInResource.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
