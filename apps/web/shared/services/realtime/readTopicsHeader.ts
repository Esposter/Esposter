import type { TopicRead } from "#shared/models/realtime/TopicRead";

import {
  TOPICS_HEADER,
  TOPICS_HEADER_COLUMNS_SEPARATOR,
  TOPICS_HEADER_SEPARATOR,
} from "#shared/services/realtime/constants";
import { getDecodedUriComponent } from "#shared/util/text/getDecodedUriComponent";
import { columnTopicSchema } from "@esposter/db-schema";
import { z } from "zod";

// The header carries the time as text, which is parsed back into the whole number it was taken as
const readAtSchema = z.coerce.number().pipe(z.int().nonnegative());

// Reads one topic entry back: its topic, then the columns it names when the entry carries a separator after the topic. A
// Column list that names none is an empty list, and an entry with no separator names every column. A text that does not
// Decode is no topic, as the schema would refuse it
const readColumnTopic = (text: string) => {
  const [topicText = "", ...columnTexts] = text.split(TOPICS_HEADER_COLUMNS_SEPARATOR);
  const topic = getDecodedUriComponent(topicText, undefined);
  const columns = columnTexts
    .filter((columnText) => columnText !== "")
    .map((columnText) => getDecodedUriComponent(columnText, undefined));
  if (topic === undefined || columns.includes(undefined)) return undefined;

  const parsedColumnTopic = columnTopicSchema.safeParse(
    text.includes(TOPICS_HEADER_COLUMNS_SEPARATOR) ? { columns, topic } : { topic },
  );
  return parsedColumnTopic.success ? parsedColumnTopic.data : undefined;
};

// The reads one procedure path's answers made, out of a batch's topics header: each entry's topics, watched from its time with
// The signature the server made over them. An empty signature is a read the server signed nothing for, which reads back empty
export const readTopicsHeader = (headers: Headers, path: string): TopicRead[] =>
  (headers.get(TOPICS_HEADER) ?? "")
    .split(",")
    .map((value) => value.trim().split(TOPICS_HEADER_SEPARATOR))
    .filter(([valuePath]) => valuePath === path)
    .flatMap(([, readAtText, signature, ...topicTexts]) => {
      const parsedReadAt = readAtSchema.safeParse(readAtText);
      const topics = topicTexts.flatMap((topicText) => {
        const columnTopic = readColumnTopic(topicText);
        return columnTopic === undefined ? [] : [columnTopic];
      });
      return parsedReadAt.success && signature !== undefined && topics.length > 0
        ? [{ readAt: parsedReadAt.data, signature, topics }]
        : [];
    });
