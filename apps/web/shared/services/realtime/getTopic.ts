import type { Topic, TopicKind } from "@esposter/db-schema";

// The one spelling of a topic's name, so a query's declaration, a mutation's and the client's watch name it alike
export const getTopic = (kind: TopicKind, id: string): Topic => `${kind}:${id}`;
