import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { imageNodeType } from "#shared/services/pageBuilder/imageNodeType";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

describe("imageNodeType", () => {
  test("an image without alternative text cannot be saved", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { alt: "", decorative: false, id: TEST_ID, src: TEST_URL }, type: WebpageNodeType.Image }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "alt"]]);
  });

  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    // Alternative text is an attribute, so its quotes and ampersands are escaped where a label's would not be
    const images: ImageNode[] = [
      { props: { alt: "", decorative: true, id: TEST_ID, src: TEST_URL }, type: WebpageNodeType.Image },
      { props: { alt: TEST_LABEL, decorative: false, id: TEST_ID, src: TEST_URL }, type: WebpageNodeType.Image },
      { props: { alt: `"&`, decorative: false, id: TEST_ID, src: TEST_URL }, type: WebpageNodeType.Image },
    ];

    expect(images.map((image) => serializeHtml([imageNodeType.render(image)]))).toStrictEqual([
      `<img alt="" class="image" role="presentation" src="${TEST_URL}">`,
      `<img alt="${TEST_LABEL}" class="image" src="${TEST_URL}">`,
      `<img alt="&quot;&amp;" class="image" src="${TEST_URL}">`,
    ]);
  });
});
