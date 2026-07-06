import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const documentsRelation = defineRelationsPart(schema, (r) => ({
  documents: {
    user: r.one.users({
      from: r.documents.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
