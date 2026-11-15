import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(readTopicsHeader, () => {
  test("reads one path's topics out of a batch's header", () => {
    expect.hasAssertions();

    const postTopic = getTopic(TopicKind.Post, v7());
    const friendTopic = getTopic(TopicKind.Friend, v7());
    const headers = new Headers();
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("post.readPost", [postTopic]));
    headers.append(TOPICS_HEADER, formatTopicsHeaderValue("friend.readFriends", [friendTopic]));

    expect(readTopicsHeader(headers, "post.readPost")).toStrictEqual([postTopic]);
    expect(readTopicsHeader(headers, "friend.readFriends")).toStrictEqual([friendTopic]);
  });
});
