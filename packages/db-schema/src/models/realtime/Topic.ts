import { TopicKind } from "#src/models/realtime/TopicKind";
import { TOPIC_ID_MAX_LENGTH } from "#src/services/realtime/constants";
import { z } from "zod";

// A table's scope topic (the live queries design): `<table>:*` for every row of the table, or `<table>:<column>=<value>`
// For the rows a scope value names. A secret's value is its digest, so the topic never carries the credential itself
export type ScopeTopic = `${string}:${string}=${string}` | `${string}:*`;

// A piece of state a query reads and a mutation changes, named `<kind>:<id>` (the live queries design) or by a scope
// Topic the reads and writes of a table infer. A watch frame and the invalidation that answers it carry the name alone,
// Never data, so a reader refetches through its own query
export type Topic = `${TopicKind}:${string}` | ScopeTopic;

const kindTopicSchema = z.templateLiteral([z.enum(TopicKind), ":", z.string().min(1).max(TOPIC_ID_MAX_LENGTH)]);
const scopeTopicSchema = z.union([
  z.templateLiteral([z.string().min(1), ":", z.string().min(1), "=", z.string().min(1)]),
  z.templateLiteral([z.string().min(1), ":*"]),
]);

export const topicSchema = z.union([kindTopicSchema, scopeTopicSchema]) satisfies z.ZodType<Topic>;
