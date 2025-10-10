import type { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";
import type { AzureEntityType } from "@esposter/db-schema";

export type EntityTypeKey =
  | keyof typeof AzureEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
