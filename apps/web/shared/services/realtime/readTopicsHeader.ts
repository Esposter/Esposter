import type { Topic } from "@esposter/db-schema";

import { TOPICS_HEADER, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";
import { topicSchema } from "@esposter/db-schema";

// The topics the answers to one procedure path read, out of a batch's topics header. Two calls of one path in a batch
// Share their entries, so each watches the union, which costs at most a refetch it did not need
export const readTopicsHeader = (headers: Headers, path: string): Topic[] =>
  (headers.get(TOPICS_HEADER) ?? "")
    .split(",")
    .map((value) => value.trim().split(TOPICS_HEADER_SEPARATOR))
    .filter(([valuePath]) => valuePath === path)
    .flatMap(([, ...topics]) =>
      topics.flatMap((topic) => {
        const parsedTopic = topicSchema.safeParse(topic);
        return parsedTopic.success ? [parsedTopic.data] : [];
      }),
    );
