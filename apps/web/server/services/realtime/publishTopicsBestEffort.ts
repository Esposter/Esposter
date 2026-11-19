import type { ColumnTopic } from "@esposter/db-schema";

import { publishTopicsBestEffort as basePublishTopicsBestEffort } from "@esposter/db";
import { env } from "cloudflare:workers";

// The web Worker's Topic objects, through its own binding of the realtime Worker's
export const publishTopicsBestEffort = (
  getTopics: () => ColumnTopic[] | Promise<ColumnTopic[]>,
  failure: string,
): Promise<void> => basePublishTopicsBestEffort(env.TOPIC, getTopics, failure);
