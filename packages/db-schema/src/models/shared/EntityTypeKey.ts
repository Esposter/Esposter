import type { AzureEntityType } from "#src/models/azure/table/AzureEntityType";
import type { DatabaseEntityType } from "#src/models/shared/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#src/models/shared/DerivedDatabaseEntityType";

export type EntityTypeKey =
  | keyof typeof AzureEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
