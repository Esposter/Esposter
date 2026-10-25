import type { TextNode } from "#shared/models/pageBuilder/TextNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { describe, expect, test } from "vitest";

describe("textNodeType", () => {
  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    // A note's text is written as escaped text, and an empty note publishes as an empty block
    const texts: TextNode[] = [
      { props: { content: { content: [], type: "doc" }, id: TEST_ID }, type: WebpageNodeType.Text },
      {
        props: {
          content: {
            content: [{ content: [{ text: `${TEST_LABEL} <b>&`, type: "text" }], type: "paragraph" }],
            type: "doc",
          },
          id: TEST_ID,
        },
        type: WebpageNodeType.Text,
      },
    ];

    expect(texts.map((text) => serializeHtml([textNodeType.render(text)]))).toStrictEqual([
      '<div class="text"></div>',
      `<div class="text"><p>${TEST_LABEL} &lt;b&gt;&amp;</p></div>`,
    ]);
  });
});
