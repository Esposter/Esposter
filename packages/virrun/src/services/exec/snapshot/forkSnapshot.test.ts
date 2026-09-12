import { forkSnapshot } from "#src/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { createRecordingBackend } from "#src/services/exec/test/createRecordingBackend.test";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/exec/util/getSandboxNodeVersion"),
  () => import("#src/services/exec/test/getSandboxNodeVersion.test"),
);

describe(forkSnapshot, () => {
  const { create, createWorkspace } = setupTemporaryCacheHome();
  // The stdout the recording backend replays, so the test can see the fork's result pass through unchanged.
  const stdout = " ";
  let repository = "";

  beforeEach(() => {
    repository = createWorkspace();
  });

  test("stacks the captured upper as the sole overlay lower and runs the command", async () => {
    expect.hasAssertions();

    const { upperDirectory } = resolveSnapshotLocation(repository);
    mkdirSync(upperDirectory, { recursive: true });
    const backend = createRecordingBackend({ exitCode: 0, stderr: "", stdout });
    const result = await forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" });

    expect(result.stdout).toBe(stdout);
    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirectories: [upperDirectory] });
  });

  test("stacks extra lower directories above the deps upper, in order, so the last one wins", async () => {
    expect.hasAssertions();

    const { upperDirectory } = resolveSnapshotLocation(repository);
    mkdirSync(upperDirectory, { recursive: true });
    const prepareUpperDirectory = create();
    const backend = createRecordingBackend();
    await forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" }, [prepareUpperDirectory]);

    expect(backend.calls[0]?.overlayLayers).toStrictEqual({
      lowerDirectories: [upperDirectory, prepareUpperDirectory],
    });
  });

  test("throws when no snapshot has been captured yet", () => {
    expect.hasAssertions();

    const backend = createRecordingBackend();

    expect(() =>
      forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, forkSnapshot.name, "no captured snapshot to fork; run createSnapshot first").message}]`,
    );
  });
});
