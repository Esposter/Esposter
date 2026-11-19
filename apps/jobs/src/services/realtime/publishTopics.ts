import type { ColumnTopic } from "@esposter/db-schema";

import { publishTopics as basePublishTopics } from "@esposter/db";
import { env } from "cloudflare:workers";

// The jobs Worker's Topic objects, through its own binding of the realtime Worker's
export const publishTopics = (topics: ColumnTopic[]): Promise<void> => basePublishTopics(env.TOPIC, topics);
