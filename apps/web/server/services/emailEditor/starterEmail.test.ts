import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { readStarterEmail } from "#shared/services/pageBuilder/email/readStarterEmail";
import { describe, expect, test } from "vitest";

describe("starterEmail", () => {
  test("the starter email compiles under strict validation", async () => {
    expect.hasAssertions();

    const html = await compileEmailDocument(readStarterEmail(), { origin: TEST_ORIGIN }).match(
      (compiledHtml) => compiledHtml,
      (error) => {
        throw error;
      },
    );

    expect(html).toContain("<!doctype html>");
  });
});
