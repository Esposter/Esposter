import type { DatabaseEntityType } from "#src/models/shared/DatabaseEntityType";
import type { DerivedDatabaseEntityType } from "#src/models/shared/DerivedDatabaseEntityType";
import type { LiteralUnion } from "type-fest";

// Any string, with the known entity types still offered by the editor
export type EntityTypeKey = LiteralUnion<
  keyof typeof DatabaseEntityType | keyof typeof DerivedDatabaseEntityType,
  string
>;
