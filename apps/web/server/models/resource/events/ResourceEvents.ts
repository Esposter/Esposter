import type { Device } from "#shared/models/auth/Device";
import type { ResourceInResource } from "@esposter/db-schema";

export interface ResourceEvents {
  // The content itself is not carried: a subscriber re-reads it through the type's own read, so a large document
  // Crosses by the same path as any read rather than over the socket
  saveResourceContent: [
    [
      { apiKeyName: string; contentVersion: ResourceInResource["contentVersion"]; id: ResourceInResource["id"] },
      Device,
    ],
  ];
}
