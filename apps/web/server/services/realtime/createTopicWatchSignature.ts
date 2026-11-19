import type { ColumnTopic } from "@esposter/db-schema";

import { getTopicWatchPayload } from "@esposter/db-schema";
import { createHmac } from "node:crypto";

// The signature a read's watch carries, made with the secret the realtime Worker checks it with. It covers the person the read
// Was made for, the time it began and its topics, so the object takes a watch only for topics that person was given. A read
// With no person to sign for, or with no secret set, is signed with nothing, and the object takes such a watch unverified
export const createTopicWatchSignature = (
  userId: string | undefined,
  { readAt, topics }: { readAt: number; topics: ColumnTopic[] },
): string => {
  const secret = process.env.TOPIC_WATCH_SECRET;
  return userId && secret
    ? createHmac("sha256", secret)
        .update(getTopicWatchPayload(userId, readAt, topics))
        .digest("base64url")
    : "";
};
