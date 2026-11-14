import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const surveyResponsesInResourceRelation = defineRelationsPart(schema, (r) => ({
  surveyResponsesInResource: {
    resource: r.one.resourcesInResource({
      from: r.surveyResponsesInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
