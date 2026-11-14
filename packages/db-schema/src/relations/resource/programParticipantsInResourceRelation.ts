import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const programParticipantsInResourceRelation = defineRelationsPart(schema, (r) => ({
  programParticipantsInResource: {
    resource: r.one.resourcesInResource({
      from: r.programParticipantsInResource.resourceId,
      optional: false,
      to: r.resourcesInResource.id,
    }),
  },
}));
