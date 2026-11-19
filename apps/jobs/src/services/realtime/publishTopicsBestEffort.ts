import type { ColumnTopic } from "@esposter/db-schema";

import { publishTopicsBestEffort as basePublishTopicsBestEffort } from "@esposter/db";
import { env } from "cloudflare:workers";

// The jobs Worker's Topic objects, through its own binding of the realtime Worker's
export const publishTopicsBestEffort = (
  readTopics: () => ColumnTopic[] | Promise<ColumnTopic[]>,
  failure: string,
): Promise<void> => basePublishTopicsBestEffort(env.TOPIC, readTopics, failure);
