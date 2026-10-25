import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

describe("buttonNodeType", () => {
  test("a button with a javascript link cannot be saved", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [
        { props: { href: " javascript:alert(1)", id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
      ],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "href"]]);
  });

  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The label is written as text and the link as an attribute, so each keeps the characters its own escape owns
    const buttons: ButtonNode[] = [
      { props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
      { props: { href: `${TEST_URL}?a=1&b="2"`, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
      { props: { href: TEST_URL, id: TEST_ID, label: "<b>&" }, type: WebpageNodeType.Button },
    ];

    expect(buttons.map((button) => serializeHtml([buttonNodeType.render(button)]))).toStrictEqual([
      `<a class="button" href="${TEST_URL}">${TEST_LABEL}</a>`,
      `<a class="button" href="${TEST_URL}?a=1&amp;b=&quot;2&quot;">${TEST_LABEL}</a>`,
      `<a class="button" href="${TEST_URL}">&lt;b&gt;&amp;</a>`,
    ]);
  });
});
