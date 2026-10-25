// @vitest-environment nuxt
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import MessageModelMessageSuggestionMentionList from "@/components/Message/Model/Message/Suggestion/MentionList.vue";
import { createUser } from "@/services/message/user/createUser.test";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

const getOptionTexts = async (member: MemberInRoom) => {
  const component = await mountSuspended(MessageModelMessageSuggestionMentionList, {
    props: { command: noop, items: [member], query: "" },
  });
  return component.findAll('[role="option"]').map((option) => option.text());
};

describe("messageModelMessageSuggestionMentionList", () => {
  test("names a member by the room's display name with the account name beside it", async () => {
    expect.hasAssertions();

    const member: MemberInRoom = { ...createUser({ name: "Alice" }), displayName: "Ally" };

    await expect(getOptionTexts(member)).resolves.toStrictEqual(["Ally Alice"]);
  });

  test("names a member the room shows under their account name with no account name beside it", async () => {
    expect.hasAssertions();

    const member: MemberInRoom = { ...createUser({ name: "Alice" }), displayName: "Alice" };

    await expect(getOptionTexts(member)).resolves.toStrictEqual(["Alice"]);
  });
});
