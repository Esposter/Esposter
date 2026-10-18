import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

describe("videoNodeType", () => {
  test("a video without a title cannot be saved", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { id: TEST_ID, src: TEST_URL, title: "" }, type: WebpageNodeType.Video }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "title"]]);
  });

  test("a video with no source is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { id: TEST_ID, title: TEST_LABEL }, type: WebpageNodeType.Video }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "src"]]);
  });
});
