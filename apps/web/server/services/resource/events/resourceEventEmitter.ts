import type { Device } from "#shared/models/auth/Device";
import type { ResourceInResource } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface ResourceEvents {
  // The content itself is not carried: a subscriber re-reads it through the type's own read, so a large document
  // Crosses by the same path as any read rather than over the socket
  saveResourceContent: [
    [{ contentVersion: ResourceInResource["contentVersion"]; id: ResourceInResource["id"] }, Device],
  ];
}

export const resourceEventEmitter = new EventEmitter<ResourceEvents>();
