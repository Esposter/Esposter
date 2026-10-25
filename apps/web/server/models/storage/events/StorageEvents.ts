import type { StorageUsage } from "#shared/models/storage/StorageUsage";
import type { UserInAuth } from "@esposter/db-schema";

export interface StorageEvents {
  updateUsage: [[StorageUsage, UserInAuth["id"]]];
}
