import { sanitizeMessageHtml } from "@/services/sanitizeHtml/sanitizeMessageHtml";
import {
  getMentions,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
  MentionType,
  takeOne,
} from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(sanitizeMessageHtml, () => {
  test("preserves role mention metadata", () => {
    expect.hasAssertions();

    const roleId = crypto.randomUUID();
    const html = `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${roleId}" ${MENTION_ITEM_TYPE_ATTRIBUTE}="${MentionType.Role}"></span>`;
    const result = sanitizeMessageHtml(html);
    const mention = takeOne(getMentions(result));

    expect(mention.getAttribute(MENTION_ID_ATTRIBUTE)).toStrictEqual(roleId);
    expect(mention.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE)).toStrictEqual(MentionType.Role);
    expect(mention.getAttribute(MENTION_TYPE_ATTRIBUTE)).toStrictEqual(MENTION_TYPE);
  });
});
