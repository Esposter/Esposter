import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceLinkType, ResourceType } from "@esposter/db-schema";

// The programs that issue tokens for a survey. A Program binds its survey as a Survey link, kept in step with its
// content on every save, so the whole candidate set is one indexed lookup. The role is what decides it: a Program
// whose audience is this survey's Responses holds a Dataset link to it, which issues no tokens for it
// (/docs/architecture/resource-links). Only the survey's owner can bind it, so their programs are the whole set
export const readBoundProgramIds = async (
  db: Context["db"],
  { id, userId }: Pick<ResourceInResource, "id" | "userId">,
): Promise<ResourceInResource["id"][]> => {
  const boundPrograms = await db.query.resourcesInResource.findMany({
    columns: { id: true },
    where: {
      links: { targetId: { eq: id }, type: { eq: ResourceLinkType.Survey } },
      type: { eq: ResourceType.Program },
      userId: { eq: userId },
    },
  });
  return boundPrograms.map((program) => program.id);
};
