import type { TopicRead } from "#shared/models/realtime/TopicRead";

import { TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";

// One query's entry in the topics header: its procedure path, the time its read began, then the topics its answer read. A
// Topic is encoded whole, so a blob key's space or comma is not read as the header's own separator
export const formatTopicsHeaderValue = (path: string, { readAt, topics }: TopicRead): string =>
  [path, String(readAt), ...topics.map((topic) => encodeURIComponent(topic))].join(TOPICS_HEADER_SEPARATOR);
