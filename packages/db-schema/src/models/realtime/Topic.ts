import { TopicKind } from "#src/models/realtime/TopicKind";
import { StorageBuckets } from "#src/models/storage/StorageBucket";
import { BLOB_KEY_MAX_LENGTH, MAX_TABLE_COLUMNS, TOPIC_ID_MAX_LENGTH } from "#src/services/realtime/constants";
import { getStorageBucketBindingName } from "#src/services/storage/getStorageBucketBindingName";
import { z } from "zod";

// A blob a storage bucket holds, named `<bucket binding>:<key>` (the live queries design). A listing names the directory its
// Prefix lies in, so a write beneath that directory matches it exactly. The bucket's root is the empty key, which every listing
// Lies in, so a write publishes it and the schema accepts it
export type BlobTopic = `${string}:${string}`;

// A topic with the columns of its rows that a watch reads or a publish changes. A watch names the columns its read
// References in the topic's table, and a publish the columns its write sets (with its `$onUpdate` columns). `undefined` names
// Every column: a kind or a blob topic has no columns to name, and a row-set change (an insert or a delete) changes which rows
// A read of any column holds, so it reaches every watch of its topic
export interface ColumnTopic {
  columns?: string[] | undefined;
  topic: Topic;
}

// A table's scope topic (the live queries design): `<table>:*` for every row of the table, or `<table>:<column>=<value>`
// For the rows a scope value names. A secret's value is its digest, so the topic never carries the credential itself. A
// Column is never part of the name: the columns a watch reads or a publish changes are a `ColumnTopic`'s metadata
export type ScopeTopic = `${string}:${string}=${string}` | `${string}:*`;

// A piece of state a query reads and a mutation changes, named `<kind>:<id>` (the live queries design), by a scope topic the
// Reads and writes of a table infer, or by a blob topic. A watch frame and the invalidation that answers it carry the name
// Alone, never data, so a reader refetches through its own query
export type Topic = `${TopicKind}:${string}` | BlobTopic | ScopeTopic;

const kindTopicSchema = z.templateLiteral([z.enum(TopicKind), ":", z.string().min(1).max(TOPIC_ID_MAX_LENGTH)]);
// A table's name holds no dot, so a `<table>.<column>` name is refused: a column is not part of a topic's name
const scopeTopicSchema = z
  .union([
    z.templateLiteral([z.string().min(1), ":", z.string().min(1), "=", z.string().min(1)]),
    z.templateLiteral([z.string().min(1), ":*"]),
  ])
  .refine((topic) => !topic.slice(0, topic.indexOf(":")).includes("."));

// The bucket part of a blob topic is a binding a storage bucket names, derived from the buckets rather than listed here
export const blobBindingNames = new Set(
  StorageBuckets.map((storageBucket) => getStorageBucketBindingName(storageBucket)),
);
const blobTopicSchema = z
  .templateLiteral([z.string().min(1), ":", z.string().max(BLOB_KEY_MAX_LENGTH)])
  .refine((topic) => blobBindingNames.has(topic.slice(0, topic.indexOf(":"))));

export const topicSchema = z.union([kindTopicSchema, scopeTopicSchema, blobTopicSchema]) satisfies z.ZodType<Topic>;
export const columnTopicSchema = z.object({
  columns: z.array(z.string().min(1).max(TOPIC_ID_MAX_LENGTH)).max(MAX_TABLE_COLUMNS).optional(),
  topic: topicSchema,
}) satisfies z.ZodType<ColumnTopic>;
