import { cacheCleanCommand } from "#src/services/cli/commands/cacheCleanCommand";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { reapOrphanedWslRuns } from "#src/services/exec/wsl/reapOrphanedWslRuns";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/snapshot/removeSnapshotDirectory"), () => ({
  removeSnapshotDirectory: vi.fn<typeof removeSnapshotDirectory>(),
}));
vi.mock(import("#src/services/exec/wsl/reapOrphanedWslRuns"), () => ({
  reapOrphanedWslRuns: vi.fn<typeof reapOrphanedWslRuns>(),
}));

const setPlatform = (platform: NodeJS.Platform) =>
  Object.defineProperty(process, "platform", { configurable: true, value: platform });
// The clean's ordering contract, which nothing else enforces: the units either side of it are tested on their own, so
// What is left is that the sweep runs FIRST, blocking, and only on win32. A removal reordered ahead of it is asked to
// Delete exactly what a surviving WSL tree still holds mounted, and no type or lint rule can see that.
describe("cacheCleanCommand", () => {
  const realPlatform = process.platform;
  // `--all` additionally sweeps the host-global roots and the WSL-native source mirrors; the ordering under test is
  // The same either way, so the cheaper arm is the one exercised — it reaches exactly one removal to order against.
  const runClean = (): void => {
    cacheCleanCommand.run?.({ args: { _: [], all: false }, cmd: cacheCleanCommand, rawArgs: [] });
  };

  beforeAll(() => {
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    setPlatform(realPlatform);
  });

  // Ordered on `invocationCallOrder` rather than by asserting from inside a mocked removal: the command body runs
  // Under `getResult`, which catches whatever the removal throws — an assertion error included — and reports it as a
  // Failed clean, so an expectation raised in there is swallowed and its test passes on the reordering it exists to
  // Catch. Counts alone hold on any ordering, hence the sequence rather than `toHaveBeenCalled`.
  test("reaps the surviving WSL trees, blocking, before it removes any cache directory on Windows", () => {
    expect.hasAssertions();

    setPlatform("win32");

    runClean();

    expect(reapOrphanedWslRuns).toHaveBeenCalledExactlyOnceWith(true);
    expect(removeSnapshotDirectory).toHaveBeenCalledTimes(1);
    expect(takeOne(vi.mocked(reapOrphanedWslRuns).mock.invocationCallOrder)).toBeLessThan(
      takeOne(vi.mocked(removeSnapshotDirectory).mock.invocationCallOrder),
    );
  });

  test("reaps nothing off Windows, where there is no WSL tree to survive the run", () => {
    expect.hasAssertions();

    setPlatform("linux");

    runClean();

    expect(reapOrphanedWslRuns).not.toHaveBeenCalled();
    expect(removeSnapshotDirectory).toHaveBeenCalledTimes(1);
  });
});
