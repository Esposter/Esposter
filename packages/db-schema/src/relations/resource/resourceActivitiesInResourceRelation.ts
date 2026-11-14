import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceActivitiesInResourceRelation = defineRelationsPart(schema, (r) => ({
  resourceActivitiesInResource: {
    apiKey: r.one.apiKeysInAuth({
      from: r.resourceActivitiesInResource.apiKeyId,
      optional: true,
      to: r.apiKeysInAuth.id,
    }),
    resource: r.one.resourcesInResource({
      from: r.resourceActivitiesInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
    user: r.one.usersInAuth({ from: r.resourceActivitiesInResource.userId, optional: true, to: r.usersInAuth.id }),
  },
}));
