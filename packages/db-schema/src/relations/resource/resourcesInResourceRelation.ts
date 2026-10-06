import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourcesInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourcesInResource: {
    links: r.many.resourceLinksInResource({ from: r.resourcesInResource.id, to: r.resourceLinksInResource.sourceId }),
    publication: r.one.resourcePublicationsInResource({
      from: r.resourcesInResource.id,
      optional: true,
      to: r.resourcePublicationsInResource.resourceId,
    }),
    user: r.one.usersInAuth({ from: r.resourcesInResource.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
