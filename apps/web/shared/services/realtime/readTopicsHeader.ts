import type { TopicRead } from "#shared/models/realtime/TopicRead";

import { TOPICS_HEADER, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";
import { topicSchema } from "@esposter/db-schema";
import { z } from "zod";

// The header carries the time as text, which is parsed back into the whole number it was taken as
const readAtSchema = z.coerce.number().pipe(z.int().nonnegative());

// The reads one procedure path's answers made, out of a batch's topics header: each entry's topics, watched from its time
export const readTopicsHeader = (headers: Headers, path: string): TopicRead[] =>
  (headers.get(TOPICS_HEADER) ?? "")
    .split(",")
    .map((value) => value.trim().split(TOPICS_HEADER_SEPARATOR))
    .filter(([valuePath]) => valuePath === path)
    .flatMap(([, readAtText, ...topicTexts]) => {
      const parsedReadAt = readAtSchema.safeParse(readAtText);
      const topics = topicTexts.flatMap((topic) => {
        const parsedTopic = topicSchema.safeParse(topic);
        return parsedTopic.success ? [parsedTopic.data] : [];
      });
      return parsedReadAt.success && topics.length > 0 ? [{ readAt: parsedReadAt.data, topics }] : [];
    });
