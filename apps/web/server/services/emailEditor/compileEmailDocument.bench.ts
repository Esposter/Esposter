import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { readStarterEmail } from "#shared/services/pageBuilder/email/readStarterEmail";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { renderMjmlDocument } from "mjml-blocks";
import { describe, test } from "vitest";

// The starter email as a reader's compile sees it: the whole compile, against the MJML render alone so the report shows
// What the compile spends its time on
describe(compileEmailDocument, () => {
  test("the starter email", async ({ bench }) => {
    const starter = readStarterEmail();

    await bench.compare(
      bench("the MJML render alone", () => {
        renderMjmlDocument(starter, emailRegistry, { context: { origin: TEST_ORIGIN }, isStampingIds: false });
      }),
      bench("compile to HTML", async () => {
        await compileEmailDocument(starter, { origin: TEST_ORIGIN });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
