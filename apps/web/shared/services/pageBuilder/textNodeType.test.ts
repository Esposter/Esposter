import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { describe, expect, test } from "vitest";

describe("textNodeType", () => {
  test("a text node renders its note inside a text block", () => {
    expect.hasAssertions();

    const content = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };

    expect(
      serializeHtml([textNodeType.render({ props: { content, id: TEST_ID }, type: WebpageNodeType.Text })]),
    ).toStrictEqual('<div class="text"><p>a</p></div>');
  });
});
