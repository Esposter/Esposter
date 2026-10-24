import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { applyPatches, JsonPatchOperationType } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { applyBlockEdit } from "headless-block-editor";
import { describe, test } from "vitest";

// One paragraph of the text node at the middle of a 2,000-node page, the edit a keystroke's commit makes
const EDIT_POINTER = `/content/${MAX_WEBPAGE_NODES / 2}/props/content`;
const EDIT_CONTENT = { content: [{ content: [{ text: "Edited", type: "text" }], type: "paragraph" }], type: "doc" };

describe(applyBlockEdit, () => {
  test(`one edit to ${MAX_WEBPAGE_NODES} nodes`, async ({ bench }) => {
    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    const operations = [{ op: JsonPatchOperationType.Replace, path: EDIT_POINTER, value: EDIT_CONTENT }] as const;
    await bench.compare(
      bench("the patch alone", () => {
        applyPatches(document, [...operations]);
      }),
      bench("apply the edit, its inverse recorded", () => {
        applyBlockEdit(webpageDocumentSchema, document, [...operations]);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 10 },
    );
  });
});
