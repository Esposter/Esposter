import type { runGh } from "#src/services/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH, WINDOW_TITLE } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { openWindow } from "#src/services/coderabbit/collect/openWindow";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: vi.fn<typeof runGh>() }));

describe(openWindow, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const windowNumber = 3;

  test("overwrites a dead run's window branch under its lease when the new cut does not descend from it", () => {
    expect.hasAssertions();

    const cwd = getCwd();
    const mainSha = readSha("HEAD");
    const branch = getWindowBranch(windowNumber);
    // A dead run pushed its window and never opened it, then `develop` moved on without it
    commitFile(`${TEST_FILENAME}.ts`, "");
    publish(branch, "HEAD");
    switchTo(mainSha);
    publish(DEVELOP_BRANCH, mainSha);
    const targetSha = commitFile(`${TEST_FILENAME}/${TEST_FILENAME}.ts`, "");

    expect(
      openWindow({
        baseBranch: MAIN_BRANCH,
        baseSha: mainSha,
        cwd,
        developSha: mainSha,
        isDryRun: false,
        targetSha,
        windowNumber,
      }),
    ).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: `${WINDOW_TITLE} ${windowNumber} is open over ${MAIN_BRANCH} — its review reads only the commits above it`,
      targetSha,
    });
    expect(readSha(`origin/${branch}`)).toBe(targetSha);
  });
});
