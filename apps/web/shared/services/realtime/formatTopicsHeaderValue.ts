import type { TopicRead } from "#shared/models/realtime/TopicRead";

import { TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";

// One query's entry in the topics header: its procedure path, the time its read began, then the topics its answer read
export const formatTopicsHeaderValue = (path: string, { readAt, topics }: TopicRead): string =>
  [path, String(readAt), ...topics].join(TOPICS_HEADER_SEPARATOR);
