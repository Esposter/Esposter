import { FIXTURE_TEST_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants.test";
import { readReviewedFilePaths } from "#src/services/coderabbit/collect/readReviewedFilePaths";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe(readReviewedFilePaths, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, getCwd } = setupFixtureRepository();

  // The reshaper's measure of one commit: its own range, through the filters of the base the window is cut from
  test("counts one commit's range through the base's path filters", () => {
    expect.hasAssertions();

    const baseSha = commitFile(".coderabbit.yaml", 'reviews:\n  path_filters:\n    - "!**/generated/**"\n');
    const commitSha = commitFiles(["a.ts", "generated/b.ts"], "");
    commitFile("c.ts", "");

    expect(readReviewedFilePaths(baseSha, `${commitSha}^..${commitSha}`, getCwd())).toStrictEqual(["a.ts"]);
  });
});
