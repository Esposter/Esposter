import type { Topic } from "@esposter/db-schema";

import { getTopic, TopicKind } from "@esposter/db-schema";

// The topics of a procedure on one resource that reads or changes only that resource's own state
export const getResourceTopics = ({ input }: { input: { id: string } }): Topic[] => [
  getTopic(TopicKind.Resource, input.id),
];
