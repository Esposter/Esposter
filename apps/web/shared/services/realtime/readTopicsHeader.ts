import type { TopicRead } from "#shared/models/realtime/TopicRead";

import { TOPICS_HEADER, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";
import { topicSchema } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";
import { z } from "zod";

// The header carries the time as text, which is parsed back into the whole number it was taken as
const readAtSchema = z.coerce.number().pipe(z.int().nonnegative());

// Decodes a topic from its header encoding. A text that does not decode is no topic, as the schema would refuse it
const decodeTopic = (text: string): string | undefined =>
  getResult(() => decodeURIComponent(text)).match(
    (decoded) => decoded,
    () => undefined,
  );

// The reads one procedure path's answers made, out of a batch's topics header: each entry's topics, watched from its time
export const readTopicsHeader = (headers: Headers, path: string): TopicRead[] =>
  (headers.get(TOPICS_HEADER) ?? "")
    .split(",")
    .map((value) => value.trim().split(TOPICS_HEADER_SEPARATOR))
    .filter(([valuePath]) => valuePath === path)
    .flatMap(([, readAtText, ...topicTexts]) => {
      const parsedReadAt = readAtSchema.safeParse(readAtText);
      const topics = topicTexts.flatMap((topicText) => {
        const decoded = decodeTopic(topicText);
        const parsedTopic = decoded === undefined ? undefined : topicSchema.safeParse(decoded);
        return parsedTopic?.success ? [parsedTopic.data] : [];
      });
      return parsedReadAt.success && topics.length > 0 ? [{ readAt: parsedReadAt.data, topics }] : [];
    });
