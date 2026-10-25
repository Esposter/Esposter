import type { Device } from "#shared/models/auth/Device";
import type { ResourceInResource } from "@esposter/db-schema";

// A save another device made of an open resource: the version it wrote and the device that wrote it. The content
// Is not carried; the store reads it through the type's own read when it adopts the save
export interface ResourceSave {
  // The key an agent saved with, named in the notice; "" for a save the person made themselves
  apiKeyName: string;
  contentVersion: ResourceInResource["contentVersion"];
  device: Device;
}
