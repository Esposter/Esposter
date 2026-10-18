import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
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
});
