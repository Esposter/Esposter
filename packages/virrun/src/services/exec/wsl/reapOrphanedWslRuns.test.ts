import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_WORK_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { spawnBackground } from "#src/services/exec/util/spawnBackground";
import { VIRRUN_WSL_PROCESS_MARKER } from "#src/services/exec/wsl/constants";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { getWslRunsDirectory } from "#src/services/exec/wsl/getWslRunsDirectory";
import { reapOrphanedWslRuns } from "#src/services/exec/wsl/reapOrphanedWslRuns";
import { registerWslRun } from "#src/services/exec/wsl/registerWslRun";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readdirSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/util/spawnBackground"), () => ({
  spawnBackground: vi.fn<typeof spawnBackground>(),
}));

vi.mock(import("#src/services/exec/wsl/execWsl"), () => ({ execWsl: vi.fn<typeof execWsl>() }));

const DEAD_MARKER = `${VIRRUN_WSL_PROCESS_MARKER}-dead`;
const RECYCLED_MARKER = `${VIRRUN_WSL_PROCESS_MARKER}-recycled`;
// A registry entry left by a run whose host process is gone — the one thing the sweep acts on. The directory is
// Created here rather than left to registerWslRun, since a `cache clean` sweeps without registering a run of its own.
const seedDeadRun = (marker: string): string => {
  const runsDirectory = getWslRunsDirectory();
  const path = join(runsDirectory, `${DEAD_PID}.${marker}`);
  mkdirSync(runsDirectory, { recursive: true });
  writeFileSync(path, "");
  return path;
};

describe(reapOrphanedWslRuns, () => {
  setupTemporaryCacheHome();

  // The invariant the whole sweep rests on: a live owner is a concurrent run — including this process, whose own
  // Entry registerWslRun just wrote — so its marker can never reach the reaper.
  test("reaps only the runs whose owner is dead, and hands their markers to one reaper", () => {
    expect.hasAssertions();

    registerWslRun(VIRRUN_WSL_PROCESS_MARKER);
    const deadRunPath = seedDeadRun(DEAD_MARKER);

    reapOrphanedWslRuns();

    expect(spawnBackground).toHaveBeenCalledExactlyOnceWith("wsl.exe", expect.arrayContaining([DEAD_MARKER]));
    expect(vi.mocked(spawnBackground).mock.calls[0]?.[1]).not.toContain(VIRRUN_WSL_PROCESS_MARKER);
    // The entry is dropped so the corpse is not re-reaped by every later run; the live one is left to its owner.
    expect(existsSync(deadRunPath)).toBe(false);
    expect(readdirSync(getWslRunsDirectory())).toStrictEqual([`${process.pid}.${VIRRUN_WSL_PROCESS_MARKER}`]);
  });

  // The OS recycles a dead run's pid onto whatever starts next, so a live pid alone proves nothing: the entry's owner
  // Started before writing it, and a holder that started after it is a stranger. The parent process is that stranger
  // Once the entry is dated before it existed.
  test("reaps a run whose pid is held by a process that started after the entry was written", () => {
    expect.hasAssertions();

    const runsDirectory = getWslRunsDirectory();
    const recycledRunPath = join(runsDirectory, `${process.ppid.toString()}.${RECYCLED_MARKER}`);
    mkdirSync(runsDirectory, { recursive: true });
    writeFileSync(recycledRunPath, "");
    utimesSync(recycledRunPath, 0, 0);

    reapOrphanedWslRuns();

    expect(spawnBackground).toHaveBeenCalledExactlyOnceWith("wsl.exe", expect.arrayContaining([RECYCLED_MARKER]));
    expect(existsSync(recycledRunPath)).toBe(false);
  });

  // A clean removes exactly the dirs a corpse holds open, so its sweep runs the reaper synchronously and waits for
  // The trees it TERMs — where the startup sweep stays fire-and-forget off the critical path.
  test("runs the reaper synchronously and waits for the trees when blocking", () => {
    expect.hasAssertions();

    const deadRunPath = seedDeadRun(DEAD_MARKER);

    reapOrphanedWslRuns(true);

    expect(spawnBackground).not.toHaveBeenCalled();
    expect(execWsl).toHaveBeenCalledExactlyOnceWith(
      expect.arrayContaining([DEAD_MARKER]),
      expect.objectContaining({ timeout: WSL_WORK_TIMEOUT_MS }),
    );
    // The blocking flag reaches the script, not just the call style: its `sh -c` body carries the wait's deadline.
    expect(vi.mocked(execWsl).mock.calls[0]?.[0][3]).toContain("deadline=");
    expect(existsSync(deadRunPath)).toBe(false);
  });

  // The corpse keeps its entry when the blocking reap fails, so the next sweep re-reaps a tree that is still alive
  // Rather than forgetting it.
  test("keeps the registry entry when a blocking reap fails", () => {
    expect.hasAssertions();

    const deadRunPath = seedDeadRun(DEAD_MARKER);
    vi.mocked(execWsl).mockImplementation(() => {
      throw new InvalidOperationError(Operation.Delete, "execWsl", "wsl.exe failed");
    });

    reapOrphanedWslRuns(true);

    expect(existsSync(deadRunPath)).toBe(true);
  });

  test("spawns nothing when every registered run is still live", () => {
    expect.hasAssertions();

    registerWslRun(VIRRUN_WSL_PROCESS_MARKER);

    reapOrphanedWslRuns();

    expect(spawnBackground).not.toHaveBeenCalled();
  });

  // The first ever run on a host: the registry directory does not exist, which is not a failure to report.
  test("is a no-op before the registry exists", () => {
    expect.hasAssertions();

    expect(() => {
      reapOrphanedWslRuns();
    }).not.toThrow();
    expect(spawnBackground).not.toHaveBeenCalled();
  });
});
