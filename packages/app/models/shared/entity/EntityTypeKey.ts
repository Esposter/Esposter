import type { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import type { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "@/models/shared/entity/DerivedDatabaseEntityType";

export type EntityTypeKey =
  | keyof typeof AzureEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
