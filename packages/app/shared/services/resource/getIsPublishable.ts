import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";

export const getIsPublishable = (type: ResourceType) => Boolean(ResourceDefinitionMap[type].capabilities.publishable);
