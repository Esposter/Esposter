import type { AzureEntityType } from "#shared/models/azure/table/AzureEntityType";
import type { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";

export type EntityTypeKey =
  | keyof typeof AzureEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
