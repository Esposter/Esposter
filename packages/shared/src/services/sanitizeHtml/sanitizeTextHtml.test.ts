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

    expect(sanitizeTextHtml("<p></p><script> </script>")).toBe("<p></p>");
  });

  test("strips inline event handler attributes", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a onclick=""></a>`)).toBe("<a></a>");
  });

  test("strips javascript: protocol hrefs", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a href="javascript:"></a>`)).toBe("<a></a>");
  });

  test("strips disallowed style properties", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="position:fixed"></span>`)).toBe("<span></span>");
  });
});
