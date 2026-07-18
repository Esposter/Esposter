import type { Resource, ResourceActivityEntity } from "@esposter/db-schema";

// The payload fields are per-activityType — a Renamed carries oldName/newName, a Published carries
// PublishVersion — so every one of them is optional.
export interface WriteResourceActivityInput
  extends
    Partial<Pick<ResourceActivityEntity, "newName" | "oldName" | "publishVersion">>,
    Pick<ResourceActivityEntity, "activityType" | "userId"> {
  resourceId: Resource["id"];
}
