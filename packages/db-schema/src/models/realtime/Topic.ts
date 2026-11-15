import { TopicKind } from "#src/models/realtime/TopicKind";
import { TOPIC_ID_MAX_LENGTH } from "#src/services/realtime/constants";
import { z } from "zod";

// A piece of state a query reads and a mutation changes, named `<kind>:<id>` (the live queries design). A watch frame and
// The invalidation that answers it carry the name alone, never data, so a reader refetches through its own query
export type Topic = `${TopicKind}:${string}`;

export const topicSchema = z.templateLiteral([z.enum(TopicKind), ":", z.string().min(1).max(TOPIC_ID_MAX_LENGTH)]);
