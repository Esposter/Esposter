import type { CompositeKeyEntityType } from "#src/models/shared/CompositeKeyEntityType";
import type { DatabaseEntityType } from "#src/models/shared/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#src/models/shared/DerivedDatabaseEntityType";

export type EntityTypeKey =
  | keyof typeof CompositeKeyEntityType
  | keyof typeof DatabaseEntityType
  | keyof typeof DerivedDatabaseEntityType
  | string;
