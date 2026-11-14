import type { Topic } from "@esposter/db-schema";

import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";

// The owner's list of resources, which every listing of them reads and every change to one of them moves
export const getResourceListTopics = (userId: string | undefined): Topic[] =>
  userId === undefined ? [] : [getTopic(TopicKind.ResourceList, userId)];
