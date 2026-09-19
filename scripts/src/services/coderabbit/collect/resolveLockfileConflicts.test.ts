import type { checkIsSequencing as baseCheckIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import type { readUnmergedPaths as baseReadUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import type { rebuildLockfile as baseRebuildLockfile } from "#src/services/coderabbit/collect/rebuildLockfile";
import type { runGit as baseRunGit } from "#src/services/coderabbit/shared/runGit";

import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { LOCKFILE } from "#src/services/shared/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { checkIsSequencing, readUnmergedPaths, rebuildLockfile, runGit } = vi.hoisted(() => ({
  checkIsSequencing: vi.fn<typeof baseCheckIsSequencing>(),
  readUnmergedPaths: vi.fn<typeof baseReadUnmergedPaths>(),
  rebuildLockfile: vi.fn<typeof baseRebuildLockfile>(),
  runGit: vi.fn<typeof baseRunGit>(),
}));

vi.mock(import("#src/services/coderabbit/collect/checkIsSequencing"), () => ({
  checkIsSequencing: checkIsSequencing as unknown as typeof baseCheckIsSequencing,
}));

vi.mock(import("#src/services/coderabbit/collect/readUnmergedPaths"), () => ({
  readUnmergedPaths: readUnmergedPaths as unknown as typeof baseReadUnmergedPaths,
}));

vi.mock(import("#src/services/coderabbit/collect/rebuildLockfile"), () => ({
  rebuildLockfile: rebuildLockfile as unknown as typeof baseRebuildLockfile,
}));

vi.mock(import("#src/services/coderabbit/shared/runGit"), () => ({ runGit: runGit as unknown as typeof baseRunGit }));

describe(resolveLockfileConflicts, () => {
  const cwd = "cwd";
  // A sequencer answering this many times in a row, then reporting itself closed
  const stopFor = (turns: number) => {
    let remaining = turns;
    checkIsSequencing.mockImplementation(() => {
      if (remaining === 0) return false;
      remaining -= 1;
      return true;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    runGit.mockReturnValue("");
  });

  // Every commit that touched a manifest stops the replay on the same path, and every one has the same answer
  test("runs a replay out over as many lockfile stops as it brings", () => {
    expect.hasAssertions();

    stopFor(2);
    readUnmergedPaths.mockReturnValue([LOCKFILE]);

    expect(resolveLockfileConflicts(cwd, 3)).toBe(true);
    expect(rebuildLockfile).toHaveBeenCalledTimes(2);
  });

  // The sequencer is left exactly where the resolver expects it: mid-pick, with that commit's conflict open
  test("leaves a stop on any other path alone", () => {
    expect.hasAssertions();

    stopFor(2);
    readUnmergedPaths.mockReturnValueOnce([LOCKFILE]).mockReturnValueOnce(["apps/web/app.vue"]);

    expect(resolveLockfileConflicts(cwd, 3)).toBe(false);
    expect(rebuildLockfile).toHaveBeenCalledTimes(1);
  });

  // A turn that lands no commit would otherwise spin: the replay's own length is what bounds it
  test("gives up once it has taken a turn per commit replayed", () => {
    expect.hasAssertions();

    checkIsSequencing.mockReturnValue(true);
    readUnmergedPaths.mockReturnValue([LOCKFILE]);

    expect(resolveLockfileConflicts(cwd, 2)).toBe(false);
    expect(rebuildLockfile).toHaveBeenCalledTimes(2);
  });
});
