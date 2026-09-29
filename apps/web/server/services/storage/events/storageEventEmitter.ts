import type { StorageUsage } from "#shared/models/storage/StorageUsage";
import type { UserInAuth } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface StorageEvents {
  updateUsage: [[StorageUsage, UserInAuth["id"]]];
}

export const storageEventEmitter = new EventEmitter<StorageEvents>();
