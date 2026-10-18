import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

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
        tag: "section",
      },
      type: WebpageNodeType.Section,
    },
    { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
  ],
  root: TEST_ROOT,
};

describe.todo("constants");
