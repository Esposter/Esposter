import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

describe("webpageDocumentSchema", () => {
  test("a document with a duplicate node id is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [createButton(TEST_ID), createButton(TEST_ID)],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an id", path: ["content", 1, "props", "id"] },
    ]);
  });

  test("a document with distinct node ids is accepted", () => {
    expect.hasAssertions();

    expect(
      webpageDocumentSchema.safeParse({
        content: [createButton(TEST_ID), createButton(TEST_OTHER_ID)],
        root: TEST_ROOT,
      }).success,
    ).toBe(true);
  });
});
