import { MAIN_BRANCH, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";
import { readStackedRepairs } from "#src/services/coderabbit/collect/readStackedRepairs";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readStackedRepairs, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha } = setupFixtureRepository();
  const collectorSha = "collectorSha";
  // A repair, as the repairer commits it: the head it answered and the collector that made it, in the trailer
  const commitRepair = (basisSha = collectorSha): string => {
    commitFile(TEST_FILENAME, readSha("HEAD"));
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(TEST_FILENAME, basisSha)],
      getCwd(),
    );
    return readSha("HEAD");
  };

  test("counts the repairs stacked at the head and stops at the first commit that is not one", () => {
    expect.hasAssertions();

    commitRepair();
    commitFile(TEST_FILENAME, "");
    const headSha = commitRepair();

    expect(readStackedRepairs(headSha, collectorSha, getCwd())).toBe(1);
  });

  test("counts nothing at a head no repair made", () => {
    expect.hasAssertions();

    expect(readStackedRepairs(readSha(MAIN_BRANCH), collectorSha, getCwd())).toBe(0);
  });

  // A collector fixed since is a fresh turn for the work by itself, as it is for every marked count: the repairs
  // An older source stacked up are not this one's attempts, or the fix would wait on a person to reset the head
  test("counts nothing for the repairs another collector's source made", () => {
    expect.hasAssertions();

    for (let index = 0; index < SESSION_ATTEMPT_CAP; index += 1) commitRepair("olderCollectorSha");

    expect(readStackedRepairs(readSha("HEAD"), collectorSha, getCwd())).toBe(0);
  });

  // Past the cap the count changes nothing, so the walk ends there
  test("stops walking at the attempt cap", () => {
    expect.hasAssertions();

    for (let index = 0; index <= SESSION_ATTEMPT_CAP; index += 1) commitRepair();

    expect(readStackedRepairs(readSha("HEAD"), collectorSha, getCwd())).toBe(SESSION_ATTEMPT_CAP);
  });
});
