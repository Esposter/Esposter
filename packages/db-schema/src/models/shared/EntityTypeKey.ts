import type { AzureEntityType } from "@/models/azure/table/AzureEntityType";
import type { DatabaseEntityType } from "@/models/shared/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "@/models/shared/DerivedDatabaseEntityType";

export type EntityTypeKey =
  | keyof typeof AzureEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
