import type { Topic } from "@esposter/db-schema";

import { publishTopics as publishTopicsTo } from "@esposter/db";
import { env } from "cloudflare:workers";

// The jobs Worker's Topic objects, through its own binding of the realtime Worker's
export const publishTopics = (topics: Topic[]): Promise<void> => publishTopicsTo(env.TOPIC, topics);
