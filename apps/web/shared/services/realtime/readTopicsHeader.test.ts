import type { ColumnTopic } from "@esposter/db-schema";

import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getBlobTopic, getStorageBucketBindingName, getTopic, StorageBucket, TopicKind } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(readTopicsHeader, () => {
  test("reads one path's topics out of a batch's header", () => {
    expect.hasAssertions();

    const postTopic = { topic: getTopic(TopicKind.Post, v7()) };
    const friendTopic = { topic: getTopic(TopicKind.Friend, v7()) };
    const readAt = 0;
    const signature = "signature";
    const headers = new Headers();
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("post.readPost", { readAt, signature, topics: [postTopic] }));
    headers.append(
      TOPICS_HEADER,
      formatTopicsHeaderValue("friend.readFriends", { readAt, signature, topics: [friendTopic] }),
    );

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([{ readAt, signature, topics: [postTopic] }]);
    expect(readTopicsHeader(headers, "friend.readFriends")).toStrictEqual([
      { readAt, signature, topics: [friendTopic] },
    ]);
  });

  // The signature the server made over a read is what its watch carries, so it reads back with the read it signed, and
  // A Read with no person to sign for (a read by a signed-out person) reads back with an empty one
  test("a read's signature reads back with its topics, and an empty one reads back empty", () => {
    expect.hasAssertions();

    const postTopic = { topic: getTopic(TopicKind.Post, v7()) };
    const headers = new Headers();
    headers.append(
      TOPICS_HEADER,
      formatTopicsHeaderValue("post.readPost", { readAt: 0, signature: "signed", topics: [postTopic] }),
    );
    headers.append(
      TOPICS_HEADER,
      formatTopicsHeaderValue("post.readPost", { readAt: 0, signature: "", topics: [postTopic] }),
    );

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([
      { readAt: 0, signature: "signed", topics: [postTopic] },
      { readAt: 0, signature: "", topics: [postTopic] },
    ]);
  });

  // A blob's key is a file's name, which may hold a space or a comma, the header's own separators
  test("a topic whose key holds a space or a comma reads back whole", () => {
    expect.hasAssertions();

    const blobTopic = { topic: getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), "user/a b,c.png") };
    const headers = new Headers();
    headers.append(
      TOPICS_HEADER,
      formatTopicsHeaderValue("post.readPost", { readAt: 0, signature: "", topics: [blobTopic] }),
    );

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([
      { readAt: 0, signature: "", topics: [blobTopic] },
    ]);
  });

  // A scope topic carries the columns its read watches, which an empty set and a set of one or more both read back as
  // Written, and a topic with no columns names every column
  test("a topic's columns read back with it, an empty set as an empty set and none as none", () => {
    expect.hasAssertions();

    const scopeTopic = getTopic(TopicKind.Post, v7());
    const countTopic: ColumnTopic = { columns: [], topic: `message_usersToRooms:roomId=${v7()}` };
    const columnTopic: ColumnTopic = {
      columns: ["isHidden", "displayName"],
      topic: `message_usersToRooms:userId=${v7()}`,
    };
    const headers = new Headers();
    headers.append(
      TOPICS_HEADER,
      formatTopicsHeaderValue("room.readRooms", {
        readAt: 0,
        signature: "",
        topics: [countTopic, columnTopic, { topic: scopeTopic }],
      }),
    );

    expect(readTopicsHeader(headers, "room.readRooms")).toStrictEqual([
      { readAt: 0, signature: "", topics: [countTopic, columnTopic, { topic: scopeTopic }] },
    ]);
  });
});
