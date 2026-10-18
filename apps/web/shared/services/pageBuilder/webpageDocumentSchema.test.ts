import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

const createButton = (id: string) => ({
  props: { href: TEST_URL, id, label: TEST_LABEL },
  type: WebpageNodeType.Button,
});

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

  test("a document over the node limit is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: Array.from({ length: MAX_WEBPAGE_NODES + 1 }, (_value, index) => createButton(`${index}`)),
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: `holds more than ${MAX_WEBPAGE_NODES} nodes`, path: ["content"] },
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
