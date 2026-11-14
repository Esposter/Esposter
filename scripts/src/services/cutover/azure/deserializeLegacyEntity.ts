import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";
import type { StreamTable } from "@esposter/db-schema";

import { legacyJsonProperties } from "#src/services/cutover/azure/legacyJsonProperties";
import { jsonDateParse } from "@esposter/shared";

// The legacy app's read path, vendored: a JSON-stored property is parsed back, and Azure has already made every other
// property's type (a DateTime is a Date). The system properties are split off, so a mapper never sees the etag or the
// timestamp, which the copy keeps for its delta
export const deserializeLegacyEntity = (
  tableName: StreamTable,
  raw: Record<string, unknown>,
): { entity: LegacyEntity; timestamp: Date | undefined } => {
  const { etag: _etag, timestamp, ...properties } = raw;
  const jsonProperties = legacyJsonProperties[tableName];
  const entity = Object.fromEntries(
    Object.entries(properties).map(([name, value]) => [
      name,
      jsonProperties.includes(name) && typeof value === "string" ? jsonDateParse(value) : value,
    ]),
  ) as LegacyEntity;
  return { entity, timestamp: typeof timestamp === "string" ? new Date(timestamp) : undefined };
};
