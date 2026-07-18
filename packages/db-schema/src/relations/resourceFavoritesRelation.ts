import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const resourceFavoritesRelation = defineRelationsPart(schema, (r) => ({
  resourceFavorites: {
    resource: r.one.resources({
      from: r.resourceFavorites.resourceId,
      optional: false,
      to: r.resources.id,
    }),
    user: r.one.users({
      from: r.resourceFavorites.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
