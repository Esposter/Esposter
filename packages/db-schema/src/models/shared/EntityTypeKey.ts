import type { DatabaseEntityType } from "#src/models/shared/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#src/models/shared/DerivedDatabaseEntityType";

export type EntityTypeKey = keyof typeof DatabaseEntityType | keyof typeof DerivedDatabaseEntityType | string;
