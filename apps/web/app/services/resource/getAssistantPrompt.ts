import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SITE_NAME } from "@esposter/shared";

// The prompt a session receives for a line Ask Claude sent: the resource named by its id and type, so the session's
// First call reads it by id rather than searching for it, and then the line the person typed
export const getAssistantPrompt = ({ id, type }: Pick<ResourceInResource, "id" | "type">, text: string) =>
  `In ${SITE_NAME}, the ${ResourceDefinitionMap[type].title} with id ${id}: ${text}`;
