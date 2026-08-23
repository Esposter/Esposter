import { MentionType } from "#src/models/message/MentionType";
import {
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "#src/services/message/constants";
import { createMention } from "#src/services/message/createMention.test";
import { getMentions } from "#src/services/message/getMentions";
import { sanitizeTextHtml } from "#src/services/sanitizeHtml/sanitizeTextHtml";
import { takeOne } from "#src/util/array/takeOne";
import { describe, expect, test } from "vitest";

describe(sanitizeTextHtml, () => {
  test("preserves role mention metadata", () => {
    expect.hasAssertions();

    const roleId = crypto.randomUUID();
    const result = sanitizeTextHtml(createMention(roleId, MentionType.Role));
    const mention = takeOne(getMentions(result));

    expect(mention.getAttribute(MENTION_ID_ATTRIBUTE)).toStrictEqual(roleId);
    expect(mention.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE)).toStrictEqual(MentionType.Role);
    expect(mention.getAttribute(MENTION_TYPE_ATTRIBUTE)).toStrictEqual(MENTION_TYPE);
  });

  test("strips script tags and their content", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml("<p>hi</p><script>alert(1)</script>")).toBe("<p>hi</p>");
  });

  test("strips inline event handler attributes", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a href="https://example.com" onclick="alert(1)">x</a>`)).toBe(
      `<a href="https://example.com">x</a>`,
    );
  });

  test("strips javascript: protocol hrefs", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a href="javascript:alert(1)">x</a>`)).toBe("<a>x</a>");
  });

  test("strips disallowed style properties", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="position:fixed">x</span>`)).toBe(`<span>x</span>`);
  });
});
