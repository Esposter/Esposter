import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { STARTER_EMAIL_SOURCE } from "#shared/services/pageBuilder/email/starterEmailSource";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { parseMjmlDocument, renderMjmlDocument } from "mjml-blocks";
import { describe, test } from "vitest";

import { compileEmailDocument } from "./compileEmailDocument";

// The starter email as a reader's compile sees it: the whole compile, against the MJML render alone so the report shows what the compile spends its time on
describe(compileEmailDocument, () => {
  test("the starter email", async ({ bench }) => {
    const result = parseMjmlDocument(
      STARTER_EMAIL_SOURCE,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw result.error;

    await bench.compare(
      bench("the MJML render alone", () => {
        renderMjmlDocument(result.data, emailRegistry, { context: { origin: TEST_ORIGIN }, isStampingIds: false });
      }),
      bench("compile to HTML", async () => {
        await compileEmailDocument(result.data, { origin: TEST_ORIGIN });
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 10 },
    );
  });
});
