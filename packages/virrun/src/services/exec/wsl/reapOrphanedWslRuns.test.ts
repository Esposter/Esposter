import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { spawnBackground } from "#src/services/exec/util/spawnBackground";
import { VIRRUN_WSL_PROCESS_MARKER } from "#src/services/exec/wsl/constants";
import { getWslRunsDirectory } from "#src/services/exec/wsl/getWslRunsDirectory";
import { reapOrphanedWslRuns } from "#src/services/exec/wsl/reapOrphanedWslRuns";
import { registerWslRun } from "#src/services/exec/wsl/registerWslRun";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/util/spawnBackground"), () => ({
  spawnBackground: vi.fn<typeof spawnBackground>(),
}));

const DEAD_MARKER = `${VIRRUN_WSL_PROCESS_MARKER}-dead`;
// A registry entry left by a run whose host process is gone — the one thing the sweep acts on.
const seedDeadRun = (marker: string): string => {
  const path = join(getWslRunsDirectory(), `${DEAD_PID}.${marker}`);
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
