import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe(runReturnStroke, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();

  // The pass goes on against the develop the stroke made: a push to develop fires no run, so ending here would
  // Leave the queue waiting on the next session push
  test("fast-forwards develop onto a main it is an ancestor of and hands back main's head", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    const result = runReturnStroke({ cwd: getCwd(), developSha, isDryRun: false, isStackOpen: false, mainSha });

    expect(result).toStrictEqual({ developSha: mainSha });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(mainSha);
  });

  // Develop is the top of an open stack, which main is behind until the stack merges
  test("does nothing while a window is open, though main is ahead of develop", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));

    expect(runReturnStroke({ cwd: getCwd(), developSha, isDryRun: false, isStackOpen: true, mainSha })).toStrictEqual({
      developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("does nothing when develop and main agree", () => {
    expect.hasAssertions();

    const sha = publish(DEVELOP_BRANCH, MAIN_BRANCH);

    expect(
      runReturnStroke({ cwd: getCwd(), developSha: sha, isDryRun: false, isStackOpen: false, mainSha: sha }),
    ).toStrictEqual({ developSha: sha });
  });

  // A main that advanced on its own is folded into the next window instead
  test("does nothing when develop carries commits main lacks", () => {
    expect.hasAssertions();

    const mainSha = readSha(MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));

    expect(runReturnStroke({ cwd: getCwd(), developSha, isDryRun: false, isStackOpen: false, mainSha })).toStrictEqual({
      developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
