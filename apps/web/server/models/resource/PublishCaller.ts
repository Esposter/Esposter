import type { ResourceIdInput } from "#shared/models/db/resource/ResourceIdInput";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

// The publish procedures each publishable type's own router generates, called in process as the browser's per-type
// Router calls them, so the type's publish transform runs unchanged
export interface PublishCaller {
  publishResource: (input: ResourceIdInput) => Promise<ResourcePublicationInResource>;
  unpublishResource: (input: ResourceIdInput) => Promise<ResourcePublicationInResource | undefined>;
}
