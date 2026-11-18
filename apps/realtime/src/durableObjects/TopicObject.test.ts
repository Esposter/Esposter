import type { Topic, UserObjectRpc } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { TopicObject } from "#src/durableObjects/TopicObject";
import { createMockObjectState } from "#src/services/durableObject/createMockObjectState.test";
import { TOPIC_COALESCE_MS } from "#src/services/topic/constants";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(TopicObject, () => {
  const topic: Topic = `post:${v7()}`;
  // Each subscriber's user object as the topic reaches it, so a test reads which users heard of a change
  const userIdInvalidateMap = new Map<string, Mock<UserObjectRpc["invalidate"]>>();
  const getInvalidate = (userId: string) => {
    const existingInvalidate = userIdInvalidateMap.get(userId);
    if (existingInvalidate) return existingInvalidate;

    const invalidate = vi.fn<UserObjectRpc["invalidate"]>(() => Promise.resolve());
    userIdInvalidateMap.set(userId, invalidate);
    return invalidate;
  };
  const environment = {
    USER: { get: (userId: string) => ({ invalidate: getInvalidate(userId) }), idFromName: (userId: string) => userId },
  } as unknown as Cloudflare.Env;

  const createTopicObject = () => {
    const state = createMockObjectState(topic);
    return { object: new TopicObject(state.ctx as unknown as DurableObjectState, environment), state };
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    userIdInvalidateMap.clear();
  });

  test("a burst of publishes reaches each subscriber once, when the window closes", async () => {
    expect.hasAssertions();

    const { object, state } = createTopicObject();
    const userIds = [v7(), v7()];
    await Promise.all(userIds.map((userId) => object.subscribe(userId, 0)));
    await object.publish();
    await object.publish();

    await expect(state.ctx.storage.getAlarm()).resolves.toBe(TOPIC_COALESCE_MS);

    await object.alarm();

    for (const userId of userIds) expect(getInvalidate(userId)).toHaveBeenCalledExactlyOnceWith(topic);
  });

  test("an unsubscribed user no longer hears of a change", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const userId = v7();
    await object.subscribe(userId, 0);
    await object.unsubscribe(userId);
    await object.publish();
    await object.alarm();

    expect(getInvalidate(userId)).not.toHaveBeenCalled();
  });

  // A read that began before the topic's last publish may hold a state the publish changed, so the subscriber is told now.
  // Waiting for the publish's alarm would leave the subscriber stale for the length of the window
  test("a subscription that arrives after a newer publish is notified at once", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const userId = v7();
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ seconds: 5 }));
    await object.publish();
    await object.subscribe(userId, 0);

    expect(getInvalidate(userId)).toHaveBeenCalledExactlyOnceWith(topic);
  });

  // A read that began after the last publish already holds every write it published.
  // So the subscriber waits for the next publish, whose alarm tells it
  test("a subscription whose read began after the last publish waits for the next one", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const userId = v7();
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ seconds: 5 }));
    await object.publish();
    await object.subscribe(userId, Temporal.Instant.fromEpochMilliseconds(0).add({ seconds: 7 }).epochMilliseconds);

    expect(getInvalidate(userId)).not.toHaveBeenCalled();

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ seconds: 8 }));
    await object.publish();
    await object.alarm();

    expect(getInvalidate(userId)).toHaveBeenCalledExactlyOnceWith(topic);
  });
});
