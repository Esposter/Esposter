import { readRebaseStopLines } from "#src/services/land/readRebaseStopLines";
import { QUEUE_BRANCH, REMOTE_NAME } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { spawnGit } from "#src/services/shared/spawnGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readRebaseStopLines, () => {
  const PATH = "README.md";
  const { commitFile, getCwd, publish, switchTo } = setupFixtureRepository();

  // The landing's pull replays the checkout's commit onto the queue's tip, which holds a conflicting change, so the pull
  // Stops with its rebase in progress
  const pauseRebase = (): void => {
    const base = commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");
    commitFile(PATH, "peer");
    publish(QUEUE_BRANCH, "HEAD");
    switchTo(base);
    commitFile(PATH, "mine");
    expect(spawnGit(["pull", "--rebase", REMOTE_NAME, QUEUE_BRANCH], getCwd()).status).not.toBe(0);
  };

  test("names each path still unmerged, then the command that finishes the rebase", () => {
    expect.hasAssertions();

    pauseRebase();

    expect(readRebaseStopLines(getCwd())).toStrictEqual([
      `conflict ${PATH}`,
      "rebase in progress: git rebase --continue once its conflicts are staged, or git rebase --abort to drop it",
    ]);
  });

  // The author who stages the resolution without continuing leaves no path unmerged, and the pull that follows refuses
  // Its paused rebase, so the line that names the rebase is the only one left to print
  test("names the paused rebase alone once its conflicts are staged", () => {
    expect.hasAssertions();

    pauseRebase();
    writeFileSync(join(getCwd(), PATH), "resolved");
    runGit(["add", PATH], getCwd());

    expect(readRebaseStopLines(getCwd())).toStrictEqual([
      "rebase in progress: git rebase --continue once its conflicts are staged, or git rebase --abort to drop it",
    ]);
  });
});
