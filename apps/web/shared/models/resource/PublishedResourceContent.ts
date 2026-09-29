import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

export interface PublishedResourceContent<TType extends ResourceType> {
  content: ResourceContent<TType>;
  name: ResourceInResource["name"];
}
