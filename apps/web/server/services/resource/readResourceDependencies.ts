import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceReferences } from "#shared/models/resource/ResourceReferences";
import type { ResourceInResource } from "@esposter/db-schema";

import { MAX_READ_LIMIT } from "@esposter/shared";

// What a resource's content references, read off its own links. The target id carries no foreign key, so the targets
// Are a second read by id rather than a relation, and one the caller cannot read is only counted: the reference is
// Their own content, but what it names is not theirs to read
export const readResourceDependencies = async (
  ctx: AuthedContext,
  id: ResourceInResource["id"],
): Promise<Pick<ResourceReferences, "dependencies" | "missingDependencyCount">> => {
  const links = await ctx.db.query.resourceLinksInResource.findMany({
    columns: { targetId: true },
    limit: MAX_READ_LIMIT,
    where: { sourceId: { eq: id } },
  });
  // A resource bound in two roles, as a survey that is both a program's audience and its survey, is one dependency
  const targetIds = new Set(links.map(({ targetId }) => targetId));
  if (targetIds.size === 0) return { dependencies: [], missingDependencyCount: 0 };

  const dependencies = await ctx.db.query.resourcesInResource.findMany({
    columns: { id: true, name: true, type: true },
    limit: MAX_READ_LIMIT,
    orderBy: { name: "asc" },
    where: { deletedAt: { isNull: true }, id: { in: [...targetIds] }, userId: { eq: ctx.getSessionPayload.user.id } },
  });
  return { dependencies, missingDependencyCount: targetIds.size - dependencies.length };
};
