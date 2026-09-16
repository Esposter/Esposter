import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { readExpressShas } from "#src/services/coderabbit/collect/readExpressShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readExpressShas, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;

  test("reads a whole set in one pass and names only the commits that claim no review", () => {
    expect.hasAssertions();

    const plainSha = commitFile(filePath, "");
    commitFile(filePath, " ");
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    const claimedSha = readSha("HEAD");

    expect(readExpressShas([plainSha, claimedSha], getCwd())).toStrictEqual(new Set([claimedSha]));
  });

  // `git log --no-walk` with no revisions walks HEAD, which would read a claim off a commit nobody asked about
  test("reads nothing for an empty set", () => {
    expect.hasAssertions();

    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );

    expect(readExpressShas([], getCwd())).toStrictEqual(new Set());
  });
});
