import type { ResourceLinkTarget } from "#server/models/resource/link/ResourceLinkTarget";
import type { ResourceType } from "@esposter/db-schema";

import { createGetResourceLinkTargets } from "#server/services/resource/link/createGetResourceLinkTargets";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypes } from "@esposter/db-schema";

// Each type's links, read off its content schema once — the schema is the only place a link is declared, so
// Nothing here is written per type, and a type declaring none has no entry. A Blueprint declares none: its
// Entries' content is `z.unknown()`, a template whose ids are re-resolved at deploy, and each resource a deploy
// Creates indexes its own links as it is saved
export const ResourceTypeGetLinkTargetsMap = new Map<ResourceType, (content: unknown) => ResourceLinkTarget[]>(
  ResourceTypes.flatMap((type) => {
    const getResourceLinkTargets = createGetResourceLinkTargets(ResourceDefinitionMap[type].contentSchema);
    return getResourceLinkTargets ? [[type, getResourceLinkTargets]] : [];
  }),
);
