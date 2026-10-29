import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { TEST_CONTEXT } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { renderWebpageDocument } from "#shared/services/pageBuilder/renderWebpageDocument";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The largest page a webpage holds against a tenth of it, so the report shows whether the render grows with the page
describe(renderWebpageDocument, () => {
  test(`${MAX_WEBPAGE_NODES} nodes`, async ({ bench }) => {
    const tenthDocument = createTestTextDocument(MAX_WEBPAGE_NODES / 10);
    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    await bench.compare(
      bench("a tenth of the nodes", () => {
        renderWebpageDocument(tenthDocument, TEST_CONTEXT);
      }),
      bench("all the nodes", () => {
        renderWebpageDocument(document, TEST_CONTEXT);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 },
    );
  });
});
