import type { ResourceActivityEntity, ResourceInResource } from "@esposter/db-schema";

// The payload fields are per-activityType — a Renamed carries oldName/newName, a Published carries
// `publishVersion` — so every one of them is optional. Who wrote it is read off the context, never passed
export interface WriteResourceActivityInput
  extends
    Partial<Pick<ResourceActivityEntity, "newName" | "oldName" | "publishVersion">>,
    Pick<ResourceActivityEntity, "activityType"> {
  resourceId: ResourceInResource["id"];
}
