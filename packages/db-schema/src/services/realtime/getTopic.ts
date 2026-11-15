import type { Topic } from "#src/models/realtime/Topic";
import type { TopicKind } from "#src/models/realtime/TopicKind";

// The one spelling of a topic's name, so a query's declaration, a mutation's, a job's and the client's watch name it alike
export const getTopic = (kind: TopicKind, id: string): Topic => `${kind}:${id}`;
