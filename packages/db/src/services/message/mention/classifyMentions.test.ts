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

    const classifiedMentions = classifyMentions("");

    expect(classifiedMentions.broadcastIds).toHaveLength(0);
    expect(classifiedMentions.regularUserIds).toHaveLength(0);
    expect(classifiedMentions.roleIds).toHaveLength(0);
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

    const classifiedMentions = classifyMentions(message);

    expect(classifiedMentions.broadcastIds).toStrictEqual([MENTION_EVERYONE_ID, MENTION_HERE_ID]);
    expect(classifiedMentions.regularUserIds).toStrictEqual([userId, otherUserId]);
    expect(classifiedMentions.roleIds).toStrictEqual([roleId]);
  });

  test("mention without data-id is ignored", () => {
    expect.hasAssertions();

    const classifiedMentions = classifyMentions(`<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}"></span>`);

    expect(classifiedMentions.broadcastIds).toHaveLength(0);
    expect(classifiedMentions.regularUserIds).toHaveLength(0);
    expect(classifiedMentions.roleIds).toHaveLength(0);
  });
});
