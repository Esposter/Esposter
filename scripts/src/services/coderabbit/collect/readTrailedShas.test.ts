import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readTrailedShas, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;

  test("reads a whole set in one pass and names only the commits carrying the trailer", () => {
    expect.hasAssertions();

    const plainSha = commitFile(filePath, "");
    commitFile(filePath, " ");
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    const claimedSha = readSha("HEAD");

    expect(readTrailedShas([plainSha, claimedSha], EXPRESS_TRAILER, getCwd())).toStrictEqual(new Set([claimedSha]));
  });

  // `git log --no-walk` with no revisions walks HEAD, which would read a claim off a commit nobody asked about
  test("reads nothing for an empty set", () => {
    expect.hasAssertions();

    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );

    expect(readTrailedShas([], EXPRESS_TRAILER, getCwd())).toStrictEqual(new Set());
  });
});
