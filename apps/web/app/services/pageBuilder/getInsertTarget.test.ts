import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getInsertTarget, () => {
  const TEST_COLUMNS_DOCUMENT: WebpageDocument = {
    content: [
      {
        props: {
          children: [{ props: { children: [], id: TEST_ID }, type: WebpageNodeType.Columns }],
          id: TEST_SECTION_ID,
          tag: HtmlTag.Section,
        },
        type: WebpageNodeType.Section,
      },
    ],
    root: TEST_ROOT,
  };

  test("a column goes to the start of the empty columns it is selected in", () => {
    expect.hasAssertions();

    expect(
      getInsertTarget(webpageKind, TEST_COLUMNS_DOCUMENT, WebpageNodeType.Column, "/content/0/props/children/0"),
    ).toStrictEqual({ index: 0, slotPointer: "/content/0/props/children/0/props/children" });
  });

  test("a node the selected container's slot refuses goes straight after the container", () => {
    expect.hasAssertions();

    expect(
      getInsertTarget(webpageKind, TEST_COLUMNS_DOCUMENT, WebpageNodeType.Text, "/content/0/props/children/0"),
    ).toStrictEqual({ index: 1, slotPointer: "/content/0/props/children" });
  });

  test("with no node selected, a node goes to the end of the page", () => {
    expect.hasAssertions();

    expect(getInsertTarget(webpageKind, TEST_WEBPAGE, WebpageNodeType.Text, undefined)).toStrictEqual({
      index: 2,
      slotPointer: "/content",
    });
  });

  test("a selected node places the new node straight after it in its own slot", () => {
    expect.hasAssertions();

    expect(
      getInsertTarget(webpageKind, TEST_WEBPAGE, WebpageNodeType.Text, "/content/0/props/children/0"),
    ).toStrictEqual({ index: 1, slotPointer: "/content/0/props/children" });
  });
});
