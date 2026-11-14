import type { SerializedEntity } from "#src/models/streams/SerializedEntity";
import type { AzureEntity, AzureUpdateEntity } from "@esposter/db-schema";

// The row keeps an entity's JSON as it is, so a value is written as it is, except a Date: JSON has no Date, so it is
// written as `{ date }`, the form readStreamRow reads back as the Date it was
export const serializeEntity = (entity: AzureUpdateEntity<AzureEntity>): SerializedEntity =>
  Object.fromEntries(
    Object.entries(entity).map(([property, value]) => [
      property,
      value instanceof Date ? { date: value.toISOString() } : value,
    ]),
  ) as SerializedEntity;
