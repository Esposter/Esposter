import type { StoredColumns } from "#src/models/topic/StoredColumns";
import type { Topic, TopicObjectRpc } from "@esposter/db-schema";

import { getObjectName } from "#src/services/durableObject/getObjectName";
import {
  TOPIC_COALESCE_MS,
  TOPIC_PENDING_COLUMNS_KEY,
  TOPIC_PUBLISHED_AT_KEY,
  TOPIC_READ_SKEW_MS,
  TOPIC_SUBSCRIBER_KEY_PREFIX,
} from "#src/services/topic/constants";
import { getColumns } from "#src/services/topic/getColumns";
import { unionColumns } from "#src/services/topic/unionColumns";
import { getObjectStub } from "@esposter/db";
import { checkWakes, topicSchema } from "@esposter/db-schema";
import { DurableObject } from "cloudflare:workers";

// One Topic object per topic, named for it: the users watching it with the columns each one reads, each held as a
// Storage Key, and the time it was last published. A publish arms the alarm unless one is already set, so every write
// In the window Reaches each subscriber whose columns it changed once. A subscription whose read began before the last
// Publish is told at Once (openspec/specs/architecture/cloudflare-services/design.md)
export class TopicObject extends DurableObject implements TopicObjectRpc {
  readonly #topic: Topic = topicSchema.parse(getObjectName(this.ctx, "TopicObject"));

  // The subscribers whose columns a publish since the last alarm changed are told. The publishes are cleared before
  // They are Told, so a publish that lands while the alarm runs is told by the next one
  override async alarm(): Promise<void> {
    const pendingColumns = getColumns(await this.ctx.storage.get<StoredColumns>(TOPIC_PENDING_COLUMNS_KEY));
    await this.ctx.storage.delete(TOPIC_PENDING_COLUMNS_KEY);
    const subscribers = await this.ctx.storage.list<StoredColumns>({ prefix: TOPIC_SUBSCRIBER_KEY_PREFIX });
    const woken = [...subscribers].filter(([, subscriberColumns]) =>
      checkWakes(getColumns(subscriberColumns), pendingColumns),
    );
    await Promise.all(woken.map(([key]) => this.#invalidate(key.slice(TOPIC_SUBSCRIBER_KEY_PREFIX.length))));
  }

  // `columns` is what the write changed: a publish names the columns it changed, and one with none reaches every
  // Subscriber
  async publish(columns?: string[]): Promise<void> {
    const publishedAt = Date.now();
    await this.ctx.storage.put(TOPIC_PUBLISHED_AT_KEY, publishedAt);
    const pendingColumns = await this.ctx.storage.get<StoredColumns>(TOPIC_PENDING_COLUMNS_KEY);
    await this.ctx.storage.put(TOPIC_PENDING_COLUMNS_KEY, unionColumns(pendingColumns, columns));
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(publishedAt + TOPIC_COALESCE_MS);
  }

  // The subscriber's read began at `readAt`, and a publish since then may be one its answer misses, so it is told now,
  // Whatever columns the publish changed: the object keeps no history of publishes to match against the read's start.
  // `columns` is what the read references in the topic's table, and a subscriber that already watches the topic reads
  // The union
  async subscribe(userId: string, readAt: number, columns?: string[]): Promise<void> {
    const key = `${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`;
    const subscribedColumns = await this.ctx.storage.get<StoredColumns>(key);
    await this.ctx.storage.put(key, unionColumns(subscribedColumns, columns));
    const publishedAt = await this.ctx.storage.get<number>(TOPIC_PUBLISHED_AT_KEY);
    if (publishedAt !== undefined && publishedAt >= readAt - TOPIC_READ_SKEW_MS) await this.#invalidate(userId);
  }

  async unsubscribe(userId: string): Promise<void> {
    await this.ctx.storage.delete(`${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`);
  }

  // The user's object hears of the topic, and each of the person's tabs watching it refetches
  #invalidate(userId: string): Promise<void> {
    return getObjectStub(this.env.USER, userId).invalidate(this.#topic);
  }
}
