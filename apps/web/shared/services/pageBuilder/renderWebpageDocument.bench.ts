import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { renderWebpageDocument } from "#shared/services/pageBuilder/renderWebpageDocument";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const ORIGIN = "https://esposter.test";
// Text nodes, each its own paragraph, so a page of any size is the render a publish walks
const createDocument = (nodeCount: number): WebpageDocument => ({
  content: Array.from({ length: nodeCount }, (_value, index) => ({
    props: { content: { content: [{ type: "paragraph" }], type: "doc" }, id: `node-${index}` },
    type: WebpageNodeType.Text,
  })),
  root: { props: { lang: "en", tokens: {} } },
});

// The largest page a webpage holds against a tenth of it, so the report shows whether the render grows with the page
describe(renderWebpageDocument, () => {
  test(`${MAX_WEBPAGE_NODES} nodes`, async ({ bench }) => {
    const tenthDocument = createDocument(MAX_WEBPAGE_NODES / 10);
    const document = createDocument(MAX_WEBPAGE_NODES);
    await bench.compare(
      bench("a tenth of the nodes", () => {
        renderWebpageDocument(tenthDocument, { origin: ORIGIN });
      }),
      bench("all the nodes", () => {
        renderWebpageDocument(document, { origin: ORIGIN });
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 1 },
    );
  });
});
