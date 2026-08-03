import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createRecordingBackend } from "@/services/exec/test/createRecordingBackend.test";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { beforeEach, describe, expect, test } from "vitest";

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

    const { upperDir } = resolveSnapshotLocation(repository);
    mkdirSync(upperDir, { recursive: true });
    const backend = createRecordingBackend({ exitCode: 0, stderr: "", stdout });
    const result = await forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" });

    expect(result.stdout).toBe(stdout);
    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirs: [upperDir] });
  });

  test("stacks extra lower dirs above the deps upper, in order, so the last one wins", async () => {
    expect.hasAssertions();

    const { upperDir } = resolveSnapshotLocation(repository);
    mkdirSync(upperDir, { recursive: true });
    const prepareUpperDir = create();
    const backend = createRecordingBackend();
    await forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" }, [prepareUpperDir]);

    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirs: [upperDir, prepareUpperDir] });
  });

  test("throws when no snapshot has been captured yet", () => {
    expect.hasAssertions();

    const backend = createRecordingBackend();

    expect(() => forkSnapshot(backend, "vitest", { cwd: repository, stdio: "pipe" })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, forkSnapshot.name, "no captured snapshot to fork; run createSnapshot first").message}]`,
    );
  });
});
