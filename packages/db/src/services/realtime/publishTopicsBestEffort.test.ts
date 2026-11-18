import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { noop, ZERO_UUID } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

// Each topic's object is named by the topic itself, and its publish records the topic it was named for
const createTopicNamespace = (published: string[]) => ({
  get: (id: string) => ({
    publish: () => {
      published.push(id);
      return Promise.resolve();
    },
  }),
  idFromName: (name: string) => name,
});

describe(publishTopicsBestEffort, () => {
  const failure = " ";
  const roomTopic = getTopic(TopicKind.Room, ZERO_UUID);
  const userTopic = getTopic(TopicKind.User, ZERO_UUID);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A write that names a topic twice still wakes that topic's object once, and each object hears of the write
  test("publishes each changed topic once, to the object the namespace names it", async () => {
    expect.hasAssertions();

    const published: string[] = [];
    await publishTopicsBestEffort(createTopicNamespace(published), () => [roomTopic, userTopic, roomTopic], failure);

    expect(published).toStrictEqual([roomTopic, userTopic]);
  });

  // The write has already landed, so a failed publish is logged under the caller's message and the write still resolves
  test("logs a failed publish under the caller's message instead of throwing it", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const error = new Error(" ");
    const topicNamespace = {
      get: () => ({ publish: () => Promise.reject(error) }),
      idFromName: (name: string) => name,
    };

    await publishTopicsBestEffort(topicNamespace, () => [roomTopic], failure);

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(failure, error);
  });

  // The topics are read inside the same boundary, so a throw from reading them is logged the same way and publishes nothing
  test("logs a throw from reading the topics instead of throwing it, and publishes none", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const error = new Error(" ");
    const published: string[] = [];

    await publishTopicsBestEffort(
      createTopicNamespace(published),
      () => {
        throw error;
      },
      failure,
    );

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(failure, error);
    expect(published).toStrictEqual([]);
  });
});
