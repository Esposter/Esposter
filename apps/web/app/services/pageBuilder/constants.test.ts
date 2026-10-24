import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { describe } from "vitest";

export const TEST_SECTION_ID = "section";
export const TEST_NESTED_TEXT_ID = "nestedText";
export const TEST_ROOT_TEXT_ID = "rootText";
export const TEST_TEXT_CONTENT = {
  content: [{ content: [{ text: TEST_ID, type: "text" }], type: "paragraph" }],
  type: "doc",
};
export const TEST_WEBPAGE: WebpageDocument = {
  content: [
    {
      props: {
        children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_NESTED_TEXT_ID }, type: WebpageNodeType.Text }],
        id: TEST_SECTION_ID,
        tag: HtmlTag.Section,
      },
      type: WebpageNodeType.Section,
    },
    { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
  ],
  root: TEST_ROOT,
};

// Three columns in a row of 200 pixels each, the last two wrapped onto a line below the first
export const TEST_WRAPPED_ROW: OverlayBox[] = [
  { height: 40, left: 0, top: 0, width: 200 },
  { height: 40, left: 200, top: 0, width: 200 },
  { height: 40, left: 400, top: 0, width: 200 },
  { height: 40, left: 0, top: 60, width: 200 },
  { height: 40, left: 200, top: 60, width: 200 },
];
export const TEST_SINGLE_ROW: OverlayBox[] = [
  { height: 40, left: 0, top: 0, width: 200 },
  { height: 40, left: 200, top: 0, width: 200 },
  { height: 40, left: 400, top: 0, width: 200 },
];

describe.todo("constants");
