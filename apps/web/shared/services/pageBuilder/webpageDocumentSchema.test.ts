import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
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

  test("two nodes with one element id are refused on save", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [
        {
          props: { elementId: "a", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
          type: WebpageNodeType.Button,
        },
        {
          props: { elementId: "a", href: TEST_URL, id: TEST_OTHER_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
          type: WebpageNodeType.Button,
        },
      ],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an element id", path: ["content", 1, "props", "elementId"] },
    ]);
  });

  test("a button that takes a tab panel's generated element id is refused on save", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [
        {
          props: {
            children: [
              { props: { children: [], elementId: "", id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Tab },
            ],
            elementId: "",
            id: "t",
          },
          type: WebpageNodeType.Tabs,
        },
        {
          props: {
            elementId: `${TEST_ID}-panel`,
            href: TEST_URL,
            id: TEST_OTHER_ID,
            label: TEST_LABEL,
            target: ButtonTarget.SameTab,
          },
          type: WebpageNodeType.Button,
        },
      ],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an element id", path: ["content", 1, "props", "elementId"] },
    ]);
  });

  test("an element id with an unreachable character is refused on save", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [
        {
          props: { elementId: "a#b", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
          type: WebpageNodeType.Button,
        },
      ],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ path }) => path)).toStrictEqual([["content", 0, "props", "elementId"]]);
  });
});
