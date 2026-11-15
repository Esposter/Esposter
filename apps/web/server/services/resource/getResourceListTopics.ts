import type { Topic } from "@esposter/db-schema";

import { getTopic, TopicKind } from "@esposter/db-schema";

// The owner's list of resources, which every listing of them reads and every change to one of them moves
export const getResourceListTopics = (userId: string): Topic[] => [getTopic(TopicKind.ResourceList, userId)];
