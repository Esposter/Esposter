import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants.test";
import { readWindowFilePaths } from "#src/services/coderabbit/collect/readWindowFilePaths";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readWindowFilePaths, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();

  test("counts a fold of main on a window stacked above another, and not on a window cut from main", () => {
    expect.hasAssertions();

    const cwd = getCwd();
    const rootSha = readSha("HEAD");
    // The window below is cut from `main`, which then moves on past it
    const windowBelowSha = commitFile("below.ts", "");
    switchTo(rootSha);
    const mainSha = publish(MAIN_BRANCH, commitFile("main.ts", ""));
    // The window above is cut from the window below, and folds the moved `main` in
    switchTo(windowBelowSha);
    commitFile("own.ts", "");
    runGit(["merge", "--no-edit", mainSha], cwd);
    const headSha = readSha("HEAD");

    // The bot's diff against the window below counts what `main` brought, as it would
    expect(readWindowFilePaths(windowBelowSha, cwd, headSha)).toStrictEqual(["main.ts", "own.ts"]);
    // Against `main` it does not: the fold adds nothing of `main`'s own files
    expect(readWindowFilePaths(mainSha, cwd, headSha)).toStrictEqual(["below.ts", "own.ts"]);
  });
});
