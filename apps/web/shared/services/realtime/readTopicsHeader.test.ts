import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getBlobTopic, getTopic, StorageBucket, TopicKind } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(readTopicsHeader, () => {
  test("reads one path's topics out of a batch's header", () => {
    expect.hasAssertions();

    const postTopic = getTopic(TopicKind.Post, v7());
    const friendTopic = getTopic(TopicKind.Friend, v7());
    const readAt = 0;
    const headers = new Headers();
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("post.readPost", { readAt, topics: [postTopic] }));
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("friend.readFriends", { readAt, topics: [friendTopic] }));

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([{ readAt, topics: [postTopic] }]);
    expect(readTopicsHeader(headers, "friend.readFriends")).toStrictEqual([{ readAt, topics: [friendTopic] }]);
  });

  // A blob's key is a file's name, which may hold a space or a comma, the header's own separators
  test("a topic whose key holds a space or a comma reads back whole", () => {
    expect.hasAssertions();

    const blobTopic = getBlobTopic(StorageBucket.UserAssets, "user/a b,c.png");
    const headers = new Headers();
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("post.readPost", { readAt: 0, topics: [blobTopic] }));

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([{ readAt: 0, topics: [blobTopic] }]);
  });
});
