import { MentionType } from "@/models/message/MentionType";
import { classifyMentions } from "@/services/message/classifyMentions";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "@/services/message/constants";
import { describe, expect, test } from "vitest";

const createMention = (id: string, type?: MentionType) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}"${type ? ` ${MENTION_ITEM_TYPE_ATTRIBUTE}="${type}"` : ""}></span>`;

describe(classifyMentions, () => {
  test("empty string", () => {
    expect.hasAssertions();

    const result = classifyMentions("");

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });

  test("@everyone broadcast mention", () => {
    expect.hasAssertions();

    const result = classifyMentions(createMention(MENTION_EVERYONE_ID));

    expect(result.broadcastIds).toStrictEqual([MENTION_EVERYONE_ID]);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });

  test("@here broadcast mention", () => {
    expect.hasAssertions();

    const result = classifyMentions(createMention(MENTION_HERE_ID));

    expect(result.broadcastIds).toStrictEqual([MENTION_HERE_ID]);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });

  test("regular user mention", () => {
    expect.hasAssertions();

    const result = classifyMentions(createMention("user-1", MentionType.User));

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toStrictEqual(["user-1"]);
    expect(result.roleIds).toHaveLength(0);
  });

  test("role mention", () => {
    expect.hasAssertions();

    const result = classifyMentions(createMention("role-1", MentionType.Role));

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toStrictEqual(["role-1"]);
  });

  test("multiple mentions of each type", () => {
    expect.hasAssertions();

    const message = [
      createMention(MENTION_EVERYONE_ID),
      createMention(MENTION_HERE_ID),
      createMention("user-1", MentionType.User),
      createMention("user-2", MentionType.User),
      createMention("role-1", MentionType.Role),
    ].join("");

    const result = classifyMentions(message);

    expect(result.broadcastIds).toStrictEqual([MENTION_EVERYONE_ID, MENTION_HERE_ID]);
    expect(result.regularUserIds).toStrictEqual(["user-1", "user-2"]);
    expect(result.roleIds).toStrictEqual(["role-1"]);
  });

  test("mention without data-id is ignored", () => {
    expect.hasAssertions();

    const result = classifyMentions(`<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}"></span>`);

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });
});
