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

  test("strips script tags and their content", () => {
    expect.hasAssertions();

    expect(sanitizeMessageHtml(`<p>hi</p><script>alert(1)</script>`)).toBe("<p>hi</p>");
  });

  test("strips inline event handler attributes", () => {
    expect.hasAssertions();

    expect(sanitizeMessageHtml(`<a href="https://example.com" onclick="alert(1)">x</a>`)).toBe(
      `<a href="https://example.com">x</a>`,
    );
  });

  test("strips javascript: protocol hrefs", () => {
    expect.hasAssertions();

    expect(sanitizeMessageHtml(`<a href="javascript:alert(1)">x</a>`)).toBe("<a>x</a>");
  });

  test("strips disallowed style properties", () => {
    expect.hasAssertions();

    expect(sanitizeMessageHtml(`<span style="position:fixed">x</span>`)).toBe(`<span style="">x</span>`);
  });
});
