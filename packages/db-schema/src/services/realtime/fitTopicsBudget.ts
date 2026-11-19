import type { ColumnTopic, Topic } from "#src/models/realtime/Topic";

import { blobBindingNames } from "#src/models/realtime/Topic";
import { TopicKind } from "#src/models/realtime/TopicKind";
import { getTableTopic } from "#src/services/realtime/getTableTopic";
import { mergeColumnTopics } from "#src/services/realtime/mergeColumnTopics";

// The table a row topic names, `table:column=value`. A kind's id and a blob's key are not rows, though either may hold an equals
// Sign, so the prefix tells them apart: a kind's name, or a bucket's binding name, which is no table
const getRowTable = (topic: Topic, kindNames: Set<string>): string | undefined => {
  const prefix = topic.slice(0, topic.indexOf(":"));
  return topic.includes("=") && !kindNames.has(prefix) && !blobBindingNames.has(prefix) ? prefix : undefined;
};

// The topics with the row topics of each table in `tables` replaced by the table's own table-wide topic, which carries the
// Columns of the rows it replaces. Every write to a row publishes the table-wide topic too, so a read that names the table
// Wakes for every write the rows it named would have woken it for
const collapseTables = (topics: ColumnTopic[], tables: Set<string>, kindNames: Set<string>): ColumnTopic[] =>
  mergeColumnTopics(
    topics.map(({ columns, topic }) => {
      const table = getRowTable(topic, kindNames);
      return table !== undefined && tables.has(table) ? { columns, topic: getTableTopic(table) } : { columns, topic };
    }),
  );

// The topics a header names, within `budget`. Past the budget, each table's row topics collapse to the table's table-wide topic,
// A table at a time: the table holding the most row topics first, then the next, until the count fits. A row topic is the only
// Kind of topic that collapses, so a kind's topic and a blob's topic stay whole, and a list still names what it names if every
// Table has collapsed and the count does not fit
export const fitTopicsBudget = (columnTopics: ColumnTopic[], budget: number): ColumnTopic[] => {
  const topics = mergeColumnTopics(columnTopics);
  if (topics.length <= budget) return topics;
  const kindNames = new Set<string>(Object.values(TopicKind));
  const rowCounts = new Map<string, number>();
  for (const { topic } of topics) {
    const table = getRowTable(topic, kindNames);
    if (table !== undefined) rowCounts.set(table, (rowCounts.get(table) ?? 0) + 1);
  }
  // A table with one row topic and no table-wide topic of its own gains nothing from collapsing, so it is not collapsed
  const tablesToCollapse = [...rowCounts]
    .filter(([table, rowCount]) => rowCount > 1 || topics.some(({ topic }) => topic === getTableTopic(table)))
    .toSorted(
      ([firstTable, firstCount], [secondTable, secondCount]) =>
        secondCount - firstCount || (firstTable < secondTable ? -1 : 1),
    );
  const collapsed = new Set<string>();
  let fitted = topics;
  for (const [table] of tablesToCollapse) {
    if (fitted.length <= budget) break;
    collapsed.add(table);
    fitted = collapseTables(topics, collapsed, kindNames);
  }
  return fitted;
};
