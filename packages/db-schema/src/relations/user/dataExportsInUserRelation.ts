import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const dataExportsInUserRelation = defineRelationsPart(schema, (r) => ({
  dataExportsInUser: {
    user: r.one.usersInAuth({ from: r.dataExportsInUser.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
