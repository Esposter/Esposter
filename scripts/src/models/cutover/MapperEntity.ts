import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";

// An Azure entity as a mapper reads it, with the time it last changed, which the copy keeps as the row's updatedAt
export interface MapperEntity {
  entity: LegacyEntity;
  timestamp: Date | undefined;
}
