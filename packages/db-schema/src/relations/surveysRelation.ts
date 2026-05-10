import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const surveysRelation = defineRelationsPart(schema, (r) => ({
  surveys: {
    user: r.one.users({
      from: r.surveys.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
