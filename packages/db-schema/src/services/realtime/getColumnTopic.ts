import type { ColumnTopic, Topic } from "#src/models/realtime/Topic";

// The topic with the columns it names. An absent column list is left off the topic, which names every column
export const getColumnTopic = (topic: Topic, columns: string[] | undefined): ColumnTopic =>
  columns === undefined ? { topic } : { columns, topic };
