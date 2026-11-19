import type { ColumnTopic, Topic } from "#src/models/realtime/Topic";

import { getColumnTopic } from "#src/services/realtime/getColumnTopic";
import { unionColumns } from "#src/services/realtime/unionColumns";

// The topics once each, in a fixed order, with the columns of a topic's entries together. A topic that one entry names
// Every column of names every column of the merged topic, since its watch or publish reaches every column
export const mergeColumnTopics = (columnTopics: ColumnTopic[]): ColumnTopic[] => {
  const columnsMap = new Map<Topic, string[] | undefined>();
  for (const { columns, topic } of columnTopics) {
    const columnsSoFar = columnsMap.has(topic) ? columnsMap.get(topic) : [];
    columnsMap.set(topic, unionColumns(columnsSoFar, columns));
  }
  return [...columnsMap]
    .toSorted(([first], [second]) => Number(first > second) - Number(first < second))
    .map(([topic, columns]) => getColumnTopic(topic, columns));
};
