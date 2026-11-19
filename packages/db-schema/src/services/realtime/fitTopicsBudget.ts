import type { ColumnTopic, Topic } from "#src/models/realtime/Topic";

import { blobBindingNames } from "#src/models/realtime/Topic";
import { TopicKind } from "#src/models/realtime/TopicKind";
import { getBlobTopic } from "#src/services/realtime/getBlobTopic";
import { getTableTopic } from "#src/services/realtime/getTableTopic";
import { mergeColumnTopics } from "#src/services/realtime/mergeColumnTopics";

// The coarser topic a topic collapses to, which every write that names the topic also publishes, so a read collapsed to it wakes
// For each write it would have woken for. A row topic collapses to its table's table-wide topic. An object's rows name the object's
// Scope and then its table, `room/<id>:messages:col=value`, so they collapse to the table-wide topic of that table, which the
// Object's writes publish. A blob collapses to its bucket's root, the empty key every write to the bucket publishes. A table-wide
// Topic is its own coarser topic, and a kind's topic has none. A kind's id and a blob's key may hold an equals sign, so the first
// Segment, a kind's name or a bucket's binding name, is read before the equals sign is looked for
const getCoarseTopic = (topic: Topic, kindNames: Set<string>): Topic | undefined => {
  const prefix = topic.slice(0, topic.indexOf(":"));
  if (blobBindingNames.has(prefix)) return getBlobTopic(prefix, "");
  if (kindNames.has(prefix)) return undefined;
  if (!topic.includes("=")) return topic;
  return getTableTopic(topic.slice(0, topic.lastIndexOf(":", topic.indexOf("="))));
};

// The topics a header names, within `budget`. Past the budget, the topics that have a coarser form collapse to it, the largest
// Group first and then the next, until the count fits. A group's topics merge into their coarser topic, which carries the columns
// Of the topics it replaces, so a read that names it wakes for every write its topics would have woken it for. A kind's topic
// Has no coarser form and stays whole, and a list still names what it names if every group has collapsed and the count does not fit
export const fitTopicsBudget = (columnTopics: ColumnTopic[], budget: number): ColumnTopic[] => {
  const topics = mergeColumnTopics(columnTopics);
  if (topics.length <= budget) return topics;
  const kindNames = new Set<string>(Object.values(TopicKind));
  const coarseTopicOf = new Map<Topic, Topic>();
  const groupSizes = new Map<Topic, number>();
  for (const { topic } of topics) {
    const coarseTopic = getCoarseTopic(topic, kindNames);
    if (coarseTopic === undefined) continue;
    coarseTopicOf.set(topic, coarseTopic);
    groupSizes.set(coarseTopic, (groupSizes.get(coarseTopic) ?? 0) + 1);
  }
  // A group of one gains nothing from collapsing, so only a larger group is taken: the largest first, then by name
  const groupsToCollapse = [...groupSizes]
    .filter(([, groupSize]) => groupSize > 1)
    .toSorted(
      ([firstTopic, firstSize], [secondTopic, secondSize]) =>
        secondSize - firstSize || (firstTopic < secondTopic ? -1 : 1),
    );
  // A group of n topics collapses to one, so taking it removes n - 1 topics, and the groups are taken until the count fits
  const collapsed = new Set<Topic>();
  let fittedCount = topics.length;
  for (const [coarseTopic, groupSize] of groupsToCollapse) {
    if (fittedCount <= budget) break;
    collapsed.add(coarseTopic);
    fittedCount -= groupSize - 1;
  }
  return mergeColumnTopics(
    topics.map(({ columns, topic }) => {
      const coarseTopic = coarseTopicOf.get(topic);
      return coarseTopic !== undefined && collapsed.has(coarseTopic)
        ? { columns, topic: coarseTopic }
        : { columns, topic };
    }),
  );
};
