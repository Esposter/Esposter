import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const accountsRelation = defineRelationsPart(schema, (r) => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
