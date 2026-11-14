import type { StorageUsage, UserInAuth } from "@esposter/db-schema";

export interface StorageEvents {
  updateUsage: [[StorageUsage, UserInAuth["id"]]];
}
