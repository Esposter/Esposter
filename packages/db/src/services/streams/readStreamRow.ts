import type { SerializedEntity } from "#src/models/streams/SerializedEntity";
import type { StreamRow } from "#src/models/streams/StreamRow";

const checkIsDateMarker = (value: unknown): value is { date: string } =>
  typeof value === "object" && value !== null && "date" in value && typeof value.date === "string";

// The inverse of serializeEntity's Date form: a `{ date }` member reads back as the Date it was, and every other value
// is returned as it is stored
export const readStreamRow = ({
  entity,
  etag,
  partitionKey,
  rowKey,
}: StreamRow): SerializedEntity & { etag: string } => ({
  ...Object.fromEntries(
    Object.entries(entity).map(([property, value]) => [
      property,
      checkIsDateMarker(value) ? new Date(value.date) : value,
    ]),
  ),
  etag,
  partitionKey,
  rowKey,
});
