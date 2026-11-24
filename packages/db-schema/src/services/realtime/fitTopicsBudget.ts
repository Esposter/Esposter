import type { ColumnTopic, Topic } from "#src/models/realtime/Topic";

import { blobBindingNames } from "#src/models/realtime/Topic";
import { TopicKind } from "#src/models/realtime/TopicKind";
import { getBlobTopic } from "#src/services/realtime/getBlobTopic";
import { getKindTableTopic } from "#src/services/realtime/getKindTableTopic";
import { getTableTopic } from "#src/services/realtime/getTableTopic";
import { mergeColumnTopics } from "#src/services/realtime/mergeColumnTopics";

// The coarser topic a topic collapses to, which every write that names the topic also publishes, so a read collapsed to
// It wakes for each write it would have woken for. A row topic collapses to its table's table-wide topic. An object's
// Rows name the object's scope and then its table, `room/<id>:messages:col=value`, so they collapse to the table-wide
// Topic of that table, which the object's writes publish. A blob collapses to its bucket's root, the empty key every
// Write to the bucket publishes. A table-wide topic is its own coarser topic, and a kind's topic has none. A kind's id
// And a blob's key may hold an equals sign, so the first segment, a kind's name or a bucket's binding name, is read
// Before the equals sign is looked for
const getCoarseTopic = (topic: Topic, kindNames: Set<string>): Topic | undefined => {
  const prefix = topic.slice(0, topic.indexOf(":"));
  if (blobBindingNames.has(prefix)) return getBlobTopic(prefix, "");
  if (kindNames.has(prefix)) return undefined;
  if (!topic.includes("=")) return topic;
  return getTableTopic(topic.slice(0, topic.lastIndexOf(":", topic.indexOf("="))));
};

// An object's own topic, `<kind>/<id>:<table>:<rest>`, where the rest is the table's topic or one of its rows,
// Collapses to the kind's table topic for that table. An object publishes that topic for each table its own writes
// Change, so the collapse is sound for the tables the objects of the kind write, and a shared topic, which has no kind
// In front of its table, has no such form
const getKindTopicOf = (topic: Topic): Topic | undefined => {
  const kindEnd = topic.indexOf("/");
  const scopeEnd = topic.indexOf(":");
  if (kindEnd === -1 || kindEnd > scopeEnd) return undefined;
  const tableEnd = topic.indexOf(":", scopeEnd + 1);
  if (tableEnd === -1) return undefined;
  return getKindTableTopic(topic.slice(0, kindEnd), topic.slice(scopeEnd + 1, tableEnd));
};

// Collapses the topics `getCoarse` gives a coarser form, a group at a time, the largest group first and then the next,
// Until the count fits. A group's topics merge into their coarser topic, which carries the columns of the topics it
// Replaces
const collapseGroups = (
  topics: ColumnTopic[],
  getCoarse: (topic: Topic) => Topic | undefined,
  budget: number,
): ColumnTopic[] => {
  const coarseTopicOf = new Map<Topic, Topic>();
  const groupSizes = new Map<Topic, number>();
  for (const { topic } of topics) {
    const coarseTopic = getCoarse(topic);
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
  // A group of n topics collapses to one, so taking it removes n - 1 topics, and the groups are taken until the count
  // Fits
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

// The topics a header names, within `budget`. Past the budget, the topics that have a coarser form collapse to it, the
// Largest group first and then the next, until the count fits. A kind's topic has no coarser form and stays whole, and
// A list still names what it names if every group has collapsed and the count does not fit. The objects' own tables
// Collapse first, and only then, past the budget still, do the objects of a kind collapse to the kind's table topic,
// The last step
export const fitTopicsBudget = (columnTopics: ColumnTopic[], budget: number): ColumnTopic[] => {
  const topics = mergeColumnTopics(columnTopics);
  if (topics.length <= budget) return topics;
  const kindNames = new Set<string>(Object.values(TopicKind));
  const collapsedTopics = collapseGroups(topics, (topic) => getCoarseTopic(topic, kindNames), budget);
  if (collapsedTopics.length <= budget) return collapsedTopics;
  return collapseGroups(collapsedTopics, getKindTopicOf, budget);
};
