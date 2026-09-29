import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const storageLedgerInStorageRelation = defineRelationsPart(schema, (r) => ({
  storageLedgerInStorage: {
    user: r.one.usersInAuth({ from: r.storageLedgerInStorage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
