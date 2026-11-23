import type { ColumnTopic, TopicRead } from "@esposter/db-schema";

import { TOPICS_HEADER_COLUMNS_SEPARATOR, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";

// A topic is encoded whole, so a blob key's space or comma is not read as the header's own separator. Its columns
// Follow it After a separator no encoded topic holds. That separator stays when the list names no column, since a topic
// With no list Names every column, so an empty list and no list are told apart
const formatColumnTopic = ({ columns, topic }: ColumnTopic): string => {
  const encodedTopic = encodeURIComponent(topic);
  if (columns === undefined) return encodedTopic;
  const encodedColumns = columns.map((column) => encodeURIComponent(column)).join(TOPICS_HEADER_COLUMNS_SEPARATOR);
  return `${encodedTopic}${TOPICS_HEADER_COLUMNS_SEPARATOR}${encodedColumns}`;
};

// One query's entry in the topics header: its procedure path, the time its read began, the signature over the read
// (empty When it has none, so the entry keeps its shape), then the topics its answer read
export const formatTopicsHeaderValue = (path: string, { readAt, signature, topics }: TopicRead): string =>
  [path, String(readAt), signature, ...topics.map((topic) => formatColumnTopic(topic))].join(TOPICS_HEADER_SEPARATOR);
