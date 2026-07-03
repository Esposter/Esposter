import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { BackendType } from "@/models/virrun/BackendType";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const createFakeBackend = (): { calls: ExecOptions[]; exec: ExecBackend["exec"] } => {
  const calls: ExecOptions[] = [];
  return {
    calls,
    exec: (_command, options): Promise<ExecResult> => {
      calls.push(options);
      return Promise.resolve({ exitCode: 0, stderr: "", stdout: "forked" });
    },
  };
};

describe(forkSnapshot, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  let repo = "";

  beforeEach(() => {
    process.env[VIRRUN_CACHE_HOME_KEY] = create();
    repo = createWorkspace();
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("stacks the captured upper as the sole overlay lower and runs the command", async () => {
    expect.hasAssertions();

    const { upperDir } = resolveSnapshotLocation(repo);
    mkdirSync(upperDir, { recursive: true });
    const backend = { ...createFakeBackend(), name: BackendType.Os };
    const { stdout } = await forkSnapshot(backend, "vitest", { cwd: repo, stdio: "pipe" });

    expect(stdout).toBe("forked");
    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirs: [upperDir] });
  });

  test("stacks extra lower dirs above the deps upper, in order, so the last one wins", async () => {
    expect.hasAssertions();

    const { upperDir } = resolveSnapshotLocation(repo);
    mkdirSync(upperDir, { recursive: true });
    const prepareUpperDir = create();
    const backend = { ...createFakeBackend(), name: BackendType.Os };
    await forkSnapshot(backend, "vitest", { cwd: repo, stdio: "pipe" }, [prepareUpperDir]);

    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirs: [upperDir, prepareUpperDir] });
  });

  test("throws when no snapshot has been captured yet", () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(), name: BackendType.Os };

    expect(() => forkSnapshot(backend, "vitest", { cwd: repo, stdio: "pipe" })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, forkSnapshot.name, "no captured snapshot to fork; run createSnapshot first").message}]`,
    );
  });
});
