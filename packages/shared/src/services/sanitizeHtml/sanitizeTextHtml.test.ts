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
    const sanitizedHtml = sanitizeTextHtml(createMention(roleId, MentionType.Role));
    const mention = takeOne(getMentions(sanitizedHtml));

    expect(mention.getAttribute(MENTION_ID_ATTRIBUTE)).toStrictEqual(roleId);
    expect(mention.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE)).toStrictEqual(MentionType.Role);
    expect(mention.getAttribute(MENTION_TYPE_ATTRIBUTE)).toStrictEqual(MENTION_TYPE);
  });

  test("keeps a task item's checkbox, read-only with its ticked state", () => {
    expect.hasAssertions();

    expect(
      sanitizeTextHtml(
        `<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p></p></div></li></ul>`,
      ),
    ).toBe(
      `<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input disabled type="checkbox" checked="checked" /><span></span></label><div><p></p></div></li></ul>`,
    );
  });

  test("renders any input as a disabled checkbox", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<input type="text" name="" value="" />`)).toBe(`<input disabled type="checkbox" />`);
  });

  test("strips script tags and their content", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml("<p></p><script> </script>")).toBe("<p></p>");
  });

  test("strips inline event handler attributes", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a onclick=""></a>`)).toBe(`<a rel="noopener noreferrer nofollow" target="_blank"></a>`);
  });

  test("strips javascript: protocol hrefs", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<a href="javascript:"></a>`)).toBe(
      `<a rel="noopener noreferrer nofollow" target="_blank"></a>`,
    );
  });

  test("strips disallowed style properties", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="position:fixed"></span>`)).toBe("<span></span>");
  });

  // A class reaches the app's stylesheet, so markup must not borrow its utilities to lay a block over the page
  test("keeps only the classes the editor writes", () => {
    expect.hasAssertions();

    expect(
      sanitizeTextHtml(
        `<pre class="fixed"><code class="language-ts fixed"><span class="fixed hljs-keyword"></span></code></pre>`,
      ),
    ).toBe(`<pre><code class="language-ts"><span class="hljs-keyword"></span></code></pre>`);
  });
});
