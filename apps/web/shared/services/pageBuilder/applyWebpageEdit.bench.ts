import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { TEST_EDIT_CONTENT, TEST_EDIT_POINTER } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { applyPatches, JsonPatchOperationType } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { applyBlockEdit } from "headless-block-editor";
import { describe, test } from "vitest";

describe(applyBlockEdit, () => {
  test(`one edit to ${MAX_WEBPAGE_NODES} nodes`, async ({ bench }) => {
    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    const operations = [
      { op: JsonPatchOperationType.Replace, path: TEST_EDIT_POINTER, value: TEST_EDIT_CONTENT },
    ] as const;
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
