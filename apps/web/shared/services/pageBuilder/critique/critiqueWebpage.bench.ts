import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";

import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { critiqueWebpage } from "#shared/services/pageBuilder/critique/critiqueWebpage";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The largest page a webpage holds against a tenth of it, so the report shows whether the critique grows with the page
describe(critiqueWebpage, () => {
  test(`${MAX_WEBPAGE_NODES} nodes`, async ({ bench }) => {
    const sources: CritiqueSources = {
      lookupSurveyPublishState: () => SurveyPublishState.Published,
      readColor: () => undefined,
    };
    const tenthDocument = createTestTextDocument(MAX_WEBPAGE_NODES / 10);
    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    await bench.compare(
      bench("a tenth of the nodes", () => {
        critiqueWebpage(tenthDocument, sources);
      }),
      bench("all the nodes", () => {
        critiqueWebpage(document, sources);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 },
    );
  });
});
