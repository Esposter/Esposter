import type { CompositeKey } from "@esposter/db-schema";
import type { SerializedEntity } from "#src/models/streams/SerializedEntity";
import type { UpdateMode } from "#src/models/streams/UpdateMode";

// One write of a batch. An update with an etag applies only while the stored row still carries that etag, and a
// batch with any stale one applies none of its writes
export type StreamTableAction =
  | ["create", SerializedEntity]
  | ["delete", CompositeKey]
  | ["update", SerializedEntity, UpdateMode, { etag?: string }?];
