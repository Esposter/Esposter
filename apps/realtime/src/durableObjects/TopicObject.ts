import type { Topic, TopicObjectRpc } from "@esposter/db-schema";

import { getObjectName } from "#src/services/durableObject/getObjectName";
import {
  TOPIC_COALESCE_MS,
  TOPIC_PUBLISHED_AT_KEY,
  TOPIC_READ_SKEW_MS,
  TOPIC_SUBSCRIBER_KEY_PREFIX,
} from "#src/services/topic/constants";
import { topicSchema } from "@esposter/db-schema";
import { DurableObject } from "cloudflare:workers";

// One Topic object per topic, named for it: the users watching it, each held as a storage key, and the time it was last published.
// A publish arms the alarm unless one is already set, so every write in the window reaches each subscriber's user object once.
// A subscription whose read began before the last publish is told at once, since that read may not hold the publish
// (openspec/specs/architecture/cloudflare-services/design.md)
export class TopicObject extends DurableObject implements TopicObjectRpc {
  readonly #topic: Topic = topicSchema.parse(getObjectName(this.ctx, "TopicObject"));

  override async alarm(): Promise<void> {
    const subscribers = await this.ctx.storage.list({ prefix: TOPIC_SUBSCRIBER_KEY_PREFIX });
    await Promise.all(
      Array.from(subscribers.keys(), (key) => this.#invalidate(key.slice(TOPIC_SUBSCRIBER_KEY_PREFIX.length))),
    );
  }

  async publish(): Promise<void> {
    const publishedAt = Date.now();
    await this.ctx.storage.put(TOPIC_PUBLISHED_AT_KEY, publishedAt);
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(publishedAt + TOPIC_COALESCE_MS);
  }

  // `readAt` is when the subscriber's read began. A publish since then may be one its answer misses, so it is told now
  async subscribe(userId: string, readAt: number): Promise<void> {
    await this.ctx.storage.put(`${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`, true);
    const publishedAt = await this.ctx.storage.get<number>(TOPIC_PUBLISHED_AT_KEY);
    if (publishedAt !== undefined && publishedAt >= readAt - TOPIC_READ_SKEW_MS) await this.#invalidate(userId);
  }

  async unsubscribe(userId: string): Promise<void> {
    await this.ctx.storage.delete(`${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`);
  }

  // The user's object hears of the topic, and each of the person's tabs watching it refetches
  #invalidate(userId: string): Promise<void> {
    return this.env.USER.get(this.env.USER.idFromName(userId)).invalidate(this.#topic);
  }
}
