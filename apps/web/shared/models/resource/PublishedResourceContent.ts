import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { Resource, ResourceType } from "@esposter/db-schema";

export interface PublishedResourceContent<TType extends ResourceType> {
  content: ResourceContent<TType>;
  name: Resource["name"];
}
