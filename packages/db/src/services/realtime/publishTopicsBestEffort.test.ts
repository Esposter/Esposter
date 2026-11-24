import type { ColumnTopic, Topic } from "@esposter/db-schema";

import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { getColumnTopic, getTopic, TopicKind, topicSchema } from "@esposter/db-schema";
import { noop, ZERO_UUID } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

// Each topic's object is named by the topic itself, and its publish records the topic it was named for and the columns
// It was published with
const createTopicNamespace = (published: ColumnTopic[]) => ({
  get: (id: Topic) => ({
    publish: (columns?: string[]) => {
      published.push(getColumnTopic(id, columns));
      return Promise.resolve();
    },
  }),
  idFromName: (name: string) => topicSchema.parse(name),
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

    const published: ColumnTopic[] = [];
    await publishTopicsBestEffort(
      createTopicNamespace(published),
      () => [{ topic: roomTopic }, { topic: userTopic }, { topic: roomTopic }],
      failure,
    );

    expect(published).toStrictEqual([{ topic: roomTopic }, { topic: userTopic }]);
  });

  // A topic a write names with several column lists is published once with all their columns, since its object wakes
  // Each subscriber that reads any of them. A list that names every column publishes every column
  test("publishes a topic named with several column lists once, with the columns of all of them", async () => {
    expect.hasAssertions();

    const scopeTopic = `message_usersToRooms:roomId=${ZERO_UUID}` as const;
    const published: ColumnTopic[] = [];
    await publishTopicsBestEffort(
      createTopicNamespace(published),
      () => [
        { columns: ["lastReadAt"], topic: scopeTopic },
        { columns: ["mentionCount"], topic: scopeTopic },
        { topic: roomTopic },
        { columns: ["name"], topic: roomTopic },
      ],
      failure,
    );

    expect(published).toStrictEqual([
      { columns: ["lastReadAt", "mentionCount"], topic: scopeTopic },
      { topic: roomTopic },
    ]);
  });

  // The write has already landed, so a failed publish is logged under the caller's message and the write still resolves
  test("logs a failed publish under the caller's message instead of throwing it", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const error = new Error(" ");
    const topicNamespace = {
      get: () => ({ publish: () => Promise.reject(error) }),
      idFromName: (name: string) => topicSchema.parse(name),
    };

    await publishTopicsBestEffort(topicNamespace, () => [{ topic: roomTopic }], failure);

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(failure, error);
  });

  // The topics are read inside the same boundary, so a throw from reading them is logged the same way and publishes
  // None
  test("logs a throw from reading the topics instead of throwing it, and publishes none", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const error = new Error(" ");
    const published: ColumnTopic[] = [];

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
