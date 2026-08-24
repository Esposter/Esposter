import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const storageLedgerRelation = defineRelationsPart(schema, (r) => ({
  storageLedger: {
    user: r.one.users({
      from: r.storageLedger.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
