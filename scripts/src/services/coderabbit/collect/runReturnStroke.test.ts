import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe(runReturnStroke, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();

  test("fast-forwards develop onto a main it is an ancestor of", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    const outcome = runReturnStroke({ cwd: getCwd(), developSha, isDryRun: false, mainSha });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.FastForwarded,
      reason: `${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the next event measures against it`,
      targetSha: mainSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(mainSha);
  });

  test("does nothing when develop and main agree", () => {
    expect.hasAssertions();

    const sha = publish(DEVELOP_BRANCH, MAIN_BRANCH);

    expect(runReturnStroke({ cwd: getCwd(), developSha: sha, isDryRun: false, mainSha: sha })).toBeUndefined();
  });

  // A main that advanced on its own is folded into the next window instead
  test("does nothing when develop carries commits main lacks", () => {
    expect.hasAssertions();

    const mainSha = readSha(MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));

    expect(runReturnStroke({ cwd: getCwd(), developSha, isDryRun: false, mainSha })).toBeUndefined();
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
