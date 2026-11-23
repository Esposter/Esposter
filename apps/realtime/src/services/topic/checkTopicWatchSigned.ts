import type { TopicRead } from "@esposter/db-schema";

import { getTopicWatchPayload, TOPIC_WATCH_MAX_AGE_MS } from "@esposter/db-schema";
import { createHmac, timingSafeEqual } from "node:crypto";

// Whether a watch is one the server signed for the person it is made by: the signature covers exactly the topics it
// Names, for That person and that read's time, and the read began within the bound. An empty or mismatched signature is
// Refused
export const checkTopicWatchSigned = (
  userId: string,
  { readAt, signature, topics }: TopicRead,
  now: number,
): boolean => {
  if (now - readAt > TOPIC_WATCH_MAX_AGE_MS) return false;

  const expected = createHmac("sha256", process.env.TOPIC_WATCH_SECRET)
    .update(getTopicWatchPayload(userId, readAt, topics))
    .digest();
  const actual = Buffer.from(signature, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
