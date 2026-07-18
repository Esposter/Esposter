import type { Device } from "#shared/models/auth/Device";
import type { Resource } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface ResourceEvents {
  // The emitting device rides along so a client's own save is never echoed back to it.
  // Content is untyped here — the per-type factory pins it back to that type's content schema
  saveResourceContent: [[{ content: unknown; contentVersion: Resource["contentVersion"]; id: Resource["id"] }, Device]];
}

export const resourceEventEmitter = new EventEmitter<ResourceEvents>();
