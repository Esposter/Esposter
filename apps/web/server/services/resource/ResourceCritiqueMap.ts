import type { Context } from "#server/trpc/context";
import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { ResourceInResource } from "@esposter/db-schema";

import { readCritiqueSources } from "#server/services/resource/readCritiqueSources";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { critiqueWebpage } from "#shared/services/pageBuilder/critique/critiqueWebpage";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";

// The critique each type reads of its saved content. Each entry reads its own content through its own schema and reads its
// Own sources from the server, so the router dispatches on the type with a uniform call and no cast. A type with no entry
// Declares no critique
export const ResourceCritiqueMap: Partial<
  Record<ResourceType, (db: Context["db"], userId: string, id: ResourceInResource["id"]) => Promise<CritiqueFinding[]>>
> = {
  [ResourceType.Webpage]: async (db, userId, id) => {
    const content = await readResourceContent(ResourceDefinitionMap[ResourceType.Webpage].contentSchema, id);
    // A resource never saved has no nodes to check, so there is nothing to find in it
    if (content === undefined) return [];

    return critiqueWebpage(content, await readCritiqueSources(db, userId, content));
  },
};
