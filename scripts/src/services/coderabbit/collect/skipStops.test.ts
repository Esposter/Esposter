import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(skipStops, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const otherPath = `${TEST_FILENAME}-other.ts`;

  // A sequence whose second pick touches a path the tree has edited is refused by git before it starts, which leaves
  // The sequence open with no pick in progress: no commit names the stop, so nothing may be parked for it
  test("leaves a sequence open without parking when no pick is in progress", () => {
    expect.hasAssertions();

    const targetSha = commitFile(filePath, "");
    const pickedSha = commitFile(otherPath, "");
    const refusedSha = commitFile(filePath, "edited");
    switchTo(targetSha);
    writeFileSync(join(getCwd(), filePath), "local");
    const parkStop = vi.fn<(stoppedSha: string) => boolean>(() => true);

    expect(checkIsPicked([pickedSha, refusedSha], getCwd())).toBe(false);
    expect(skipStops(getCwd(), 2, parkStop)).toBe(false);
    expect(parkStop).not.toHaveBeenCalled();
    expect(checkIsSequencing(getCwd())).toBe(true);
    expect(readSha("HEAD")).not.toBe(targetSha);
  });

  // A replay its run's budget cut short meets the same conflicts on the next run, where rerere replays each resolution
  // The last one recorded and stages it — one that changes the tree, and one that leaves it as the target had it
  test.each(["resolved", "target"])("continues a stop a recorded resolution settles as %s", (resolution) => {
    expect.hasAssertions();

    const baseSha = commitFile(filePath, "base");
    const targetSha = commitFile(filePath, "target");
    switchTo(baseSha);
    const conflictSha = commitFile(filePath, "source");
    const followingSha = commitFile(otherPath, "");
    runGit(["config", "rerere.enabled", "true"], getCwd());
    runGit(["config", "rerere.autoUpdate", "true"], getCwd());
    switchTo(targetSha);
    checkIsPicked([conflictSha, followingSha], getCwd());
    writeFileSync(join(getCwd(), filePath), resolution);
    runGit(["add", filePath], getCwd());
    runGit(["-c", "core.editor=true", "commit", "--allow-empty"], getCwd());
    runGit(["cherry-pick", "--continue"], getCwd());
    switchTo(targetSha);
    const parkStop = vi.fn<(stoppedSha: string) => boolean>(() => true);

    expect(checkIsPicked([conflictSha, followingSha], getCwd())).toBe(false);
    expect(skipStops(getCwd(), 2, parkStop)).toBe(true);
    expect(parkStop).not.toHaveBeenCalled();
    expect(readFileSync(join(getCwd(), filePath), "utf8")).toBe(resolution);
    expect(runGit(["log", "--format=%b", "-1", "HEAD~1"], getCwd()).trim()).toBe(
      `(cherry picked from commit ${conflictSha})`,
    );
  });
});
