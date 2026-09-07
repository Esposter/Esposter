import type { Device } from "#shared/models/auth/Device";
import type { Resource } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface ResourceEvents {
  // Content is untyped here — the per-type factory pins it back to that type's content schema
  saveResourceContent: [[{ content: unknown; contentVersion: Resource["contentVersion"]; id: Resource["id"] }, Device]];
}

export const resourceEventEmitter = new EventEmitter<ResourceEvents>();
