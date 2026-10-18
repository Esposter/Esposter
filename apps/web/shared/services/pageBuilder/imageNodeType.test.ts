import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { imageNodeType } from "#shared/services/pageBuilder/imageNodeType";
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

  test("a decorative image publishes marked as decorative", () => {
    expect.hasAssertions();

    expect(
      imageNodeType.render({
        props: { alt: "", decorative: true, id: TEST_ID, src: TEST_URL },
        type: WebpageNodeType.Image,
      }),
    ).toStrictEqual({
      attributes: { alt: "", class: "image", role: "presentation", src: TEST_URL },
      children: [],
      tag: "img",
    });
  });
});
