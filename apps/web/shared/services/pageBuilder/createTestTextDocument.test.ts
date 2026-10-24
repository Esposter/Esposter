import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { describe } from "vitest";

// A page of text nodes, each its own paragraph, so a page of any size is one the renderer and the schema both walk
export const createTestTextDocument = (nodeCount: number): WebpageDocument => ({
  content: Array.from({ length: nodeCount }, (_value, index) => ({
    props: {
      content: { content: [{ content: [{ text: `node ${index}`, type: "text" }], type: "paragraph" }], type: "doc" },
      id: `node-${index}`,
    },
    type: WebpageNodeType.Text,
  })),
  root: TEST_ROOT,
});

describe.todo("createTestTextDocument");
