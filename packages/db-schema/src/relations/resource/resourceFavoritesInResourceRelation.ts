import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceFavoritesInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceFavoritesInResource: {
    resource: r.one.resourcesInResource({
      from: r.resourceFavoritesInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
    user: r.one.usersInAuth({ from: r.resourceFavoritesInResource.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
