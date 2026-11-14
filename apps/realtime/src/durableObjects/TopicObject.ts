import type { Topic, TopicObjectRpc } from "@esposter/db-schema";

import { getObjectName } from "#src/services/durableObject/getObjectName";
import { TOPIC_COALESCE_MS, TOPIC_SUBSCRIBER_KEY_PREFIX } from "#src/services/topic/constants";
import { topicSchema } from "@esposter/db-schema";
import { DurableObject } from "cloudflare:workers";

// One Topic object per topic, named for it: the users watching it, each held as a storage key, and the window a publish
// Opens. A publish arms the alarm unless one is already set, so every write in the window reaches each subscriber's user
// Object once, when the alarm fires (openspec/changes/infra-cloudflare-live-queries/design.md)
export class TopicObject extends DurableObject implements TopicObjectRpc {
  readonly #topic: Topic = topicSchema.parse(getObjectName(this.ctx, "TopicObject"));

  override async alarm(): Promise<void> {
    const subscribers = await this.ctx.storage.list({ prefix: TOPIC_SUBSCRIBER_KEY_PREFIX });
    await Promise.all(
      Array.from(subscribers.keys(), (key) => {
        const userId = key.slice(TOPIC_SUBSCRIBER_KEY_PREFIX.length);
        return this.env.USER.get(this.env.USER.idFromName(userId)).invalidate(this.#topic);
      }),
    );
  }

  async publish(): Promise<void> {
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + TOPIC_COALESCE_MS);
  }

  async subscribe(userId: string): Promise<void> {
    await this.ctx.storage.put(`${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`, true);
  }

  async unsubscribe(userId: string): Promise<void> {
    await this.ctx.storage.delete(`${TOPIC_SUBSCRIBER_KEY_PREFIX}${userId}`);
  }
}
