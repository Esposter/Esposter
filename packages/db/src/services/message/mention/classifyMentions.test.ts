import { createMention } from "#src/services/message/createMention.test";
import { classifyMentions } from "#src/services/message/mention/classifyMentions";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
  MentionType,
} from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(classifyMentions, () => {
  const userId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const roleId = crypto.randomUUID();

  test("empty string", () => {
    expect.hasAssertions();

    const result = classifyMentions("");

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });

  test("multiple mentions of each type", () => {
    expect.hasAssertions();

    const message = [
      createMention(MENTION_EVERYONE_ID),
      createMention(MENTION_HERE_ID),
      createMention(userId, MentionType.User),
      createMention(otherUserId, MentionType.User),
      createMention(roleId, MentionType.Role),
    ].join("");

    const result = classifyMentions(message);

    expect(result.broadcastIds).toStrictEqual([MENTION_EVERYONE_ID, MENTION_HERE_ID]);
    expect(result.regularUserIds).toStrictEqual([userId, otherUserId]);
    expect(result.roleIds).toStrictEqual([roleId]);
  });

  test("mention without data-id is ignored", () => {
    expect.hasAssertions();

    const result = classifyMentions(`<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}"></span>`);

    expect(result.broadcastIds).toHaveLength(0);
    expect(result.regularUserIds).toHaveLength(0);
    expect(result.roleIds).toHaveLength(0);
  });
});
