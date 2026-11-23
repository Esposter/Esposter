import type { ObjectInvoker } from "@esposter/db";
import type { Topic } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { TopicObject } from "#src/durableObjects/TopicObject";
import { TOPIC_COALESCE_MS } from "#src/services/topic/constants";
import { createMockObjectState } from "@esposter/db-mock";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(TopicObject, () => {
  const topic: Topic = `post:${v7()}`;
  // Each subscriber's user object as the topic reaches it, so a test reads which users heard of a change
  const userIdInvalidateMap = new Map<string, Mock<(...args: unknown[]) => Promise<void>>>();
  const getInvalidate = (userId: string) => {
    const existingInvalidate = userIdInvalidateMap.get(userId);
    if (existingInvalidate) return existingInvalidate;

    const invalidate = vi.fn<(...args: unknown[]) => Promise<void>>(() => Promise.resolve());
    userIdInvalidateMap.set(userId, invalidate);
    return invalidate;
  };
  // A subscriber's object answers its invoke, and the one method a topic calls on it is `invalidate`, so the call lands
  // On the mock
  const createUserStub = (userId: string): ObjectInvoker => ({
    invoke: async (_method, args) => {
      await getInvalidate(userId)(...args);
      return { readSet: [], result: undefined, writeSet: [] };
    },
  });
  const environment = {
    USER: { get: createUserStub, idFromName: (userId: string) => userId },
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

  // A subscriber reads some of a table's columns, and an update names the columns it sets, so an update to a column one
  // Subscriber does not read wakes only the subscribers that read it. A count reads no column, so it hears of no update
  test("a publish of an update wakes a subscriber that reads one of its columns, and no other", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const nameReader = v7();
    const lastReadAtReader = v7();
    const countReader = v7();
    await object.subscribe(nameReader, 0, ["name"]);
    await object.subscribe(lastReadAtReader, 0, ["lastReadAt"]);
    await object.subscribe(countReader, 0, []);
    await object.publish(["lastReadAt"]);
    await object.alarm();

    expect(getInvalidate(nameReader)).not.toHaveBeenCalled();
    expect(getInvalidate(countReader)).not.toHaveBeenCalled();
    expect(getInvalidate(lastReadAtReader)).toHaveBeenCalledExactlyOnceWith(topic);
  });

  // An insert or a delete changes which rows a read holds, not a column of them, so it names no column and wakes every
  // Subscriber of the topic, a count among them
  test("a row-set change wakes every subscriber, whatever columns each reads", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const nameReader = v7();
    const countReader = v7();
    await object.subscribe(nameReader, 0, ["name"]);
    await object.subscribe(countReader, 0, []);
    await object.publish();
    await object.alarm();

    expect(getInvalidate(nameReader)).toHaveBeenCalledExactlyOnceWith(topic);
    expect(getInvalidate(countReader)).toHaveBeenCalledExactlyOnceWith(topic);
  });

  // The publishes of a burst are told together: a subscriber that reads a column any of them changed hears of the burst
  // Once, and one that reads none of their columns does not
  test("a burst of updates to two columns wakes a subscriber that reads either, once", async () => {
    expect.hasAssertions();

    const { object } = createTopicObject();
    const nameReader = v7();
    const unreadReader = v7();
    await object.subscribe(nameReader, 0, ["name"]);
    await object.subscribe(unreadReader, 0, ["isHidden"]);
    await object.publish(["name"]);
    await object.publish(["lastReadAt"]);
    await object.alarm();

    expect(getInvalidate(nameReader)).toHaveBeenCalledExactlyOnceWith(topic);
    expect(getInvalidate(unreadReader)).not.toHaveBeenCalled();
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

  // A read that began before the topic's last publish may hold a state the publish changed, so the subscriber is told
  // Now. Waiting for the publish's alarm would leave the subscriber stale for the length of the window
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
