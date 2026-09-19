import { MAIN_BRANCH, REPAIRS_TRAILER, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { readStackedRepairs } from "#src/services/coderabbit/collect/readStackedRepairs";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readStackedRepairs, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha } = setupFixtureRepository();
  // A repair, as the repairer commits it: the head it answered in the trailer
  const commitRepair = (): string => {
    commitFile(TEST_FILENAME, readSha("HEAD"));
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${REPAIRS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    return readSha("HEAD");
  };

  test("counts the repairs stacked at the head and stops at the first commit that is not one", () => {
    expect.hasAssertions();

    commitRepair();
    commitFile(TEST_FILENAME, "");
    const headSha = commitRepair();

    expect(readStackedRepairs(headSha, getCwd())).toBe(1);
  });

  test("counts nothing at a head no repair made", () => {
    expect.hasAssertions();

    expect(readStackedRepairs(readSha(MAIN_BRANCH), getCwd())).toBe(0);
  });

  // Past the cap the count changes nothing, so the walk ends there
  test("stops walking at the attempt cap", () => {
    expect.hasAssertions();

    for (let index = 0; index <= SESSION_ATTEMPT_CAP; index += 1) commitRepair();

    expect(readStackedRepairs(readSha("HEAD"), getCwd())).toBe(SESSION_ATTEMPT_CAP);
  });
});
