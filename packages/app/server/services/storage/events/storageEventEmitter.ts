import type { StorageUsage } from "#shared/models/storage/StorageUsage";
import type { User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface StorageEvents {
  updateUsage: [[StorageUsage, User["id"]]];
}

export const storageEventEmitter = new EventEmitter<StorageEvents>();
