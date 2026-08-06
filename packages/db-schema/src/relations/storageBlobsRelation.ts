import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const storageBlobsRelation = defineRelationsPart(schema, (r) => ({
  storageBlobs: {
    user: r.one.users({
      from: r.storageBlobs.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
