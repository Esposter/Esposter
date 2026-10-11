import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { restoreResolutions } from "#src/services/coderabbit/collect/restoreResolutions";
import { saveResolutions } from "#src/services/coderabbit/collect/saveResolutions";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(restoreResolutions, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const branch = "branch";
  const resolvedContent = "resolved";
  // A conflict a session resolved and the replay saved, before the run ended with the replay unpushed
  const setupSavedResolution = (): { conflictSha: string; targetSha: string } => {
    const baseSha = commitFile(filePath, "base");
    const targetSha = commitFile(filePath, "target");
    switchTo(baseSha);
    const conflictSha = commitFile(filePath, "source");
    restoreResolutions({ branch, cwd: getCwd(), targetSha });
    switchTo(targetSha);
    checkIsPicked([conflictSha], getCwd());
    writeFileSync(join(getCwd(), filePath), resolvedContent);
    runGit(["add", filePath], getCwd());
    runGit(["-c", "core.editor=true", "cherry-pick", "--continue"], getCwd());
    saveResolutions({ branch, cwd: getCwd(), targetSha });
    switchTo(targetSha);
    return { conflictSha, targetSha };
  };

  test("restores the resolutions a replay onto the same target saved", () => {
    expect.hasAssertions();

    const { conflictSha, targetSha } = setupSavedResolution();
    restoreResolutions({ branch, cwd: getCwd(), targetSha });

    expect(checkIsPicked([conflictSha], getCwd())).toBe(false);
    expect(readUnmergedPaths(getCwd())).toStrictEqual([]);
    expect(readFileSync(join(getCwd(), filePath), "utf8")).toBe(resolvedContent);
  });

  test("restores nothing saved against another target", () => {
    expect.hasAssertions();

    const { conflictSha } = setupSavedResolution();
    restoreResolutions({ branch, cwd: getCwd(), targetSha: conflictSha });

    expect(checkIsPicked([conflictSha], getCwd())).toBe(false);
    expect(readUnmergedPaths(getCwd())).toStrictEqual([filePath]);
  });
});
