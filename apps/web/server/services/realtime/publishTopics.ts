import type { Topic } from "@esposter/db-schema";

import { env } from "cloudflare:workers";

// Each changed topic's object hears of the write once, however many times the mutation named it
export const publishTopics = async (topics: Topic[]): Promise<void> => {
  await Promise.all(Array.from(new Set(topics), (topic) => env.TOPIC.get(env.TOPIC.idFromName(topic)).publish()));
};
