import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { BackendType } from "@/models/virrun/BackendType";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { createWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import {
  VIRRUN_CACHE_HOME_KEY,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Records the options each call received and returns the queued exit code, standing in for the os backend.
const createFakeBackend = (exitCode: number): { calls: ExecOptions[]; exec: ExecBackend["exec"] } => {
  const calls: ExecOptions[] = [];
  return {
    calls,
    exec: (_command, options): Promise<ExecResult> => {
      calls.push(options);
      return Promise.resolve({ exitCode, stderr: "", stdout: "" });
    },
  };
};

describe(createSnapshot, () => {
  const { cleanup, create, track } = createTemporaryDirectoryTracker();
  const command = "pnpm install";
  let repo = "";

  beforeEach(() => {
    process.env[VIRRUN_CACHE_HOME_KEY] = create();
    repo = track(createWorkspaceDir());
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("captures in a private temp upper and atomically publishes it onto the final upperDir", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    const { location } = await createSnapshot(backend, command, { cwd: repo, stdio: "pipe" });

    expect(location).toStrictEqual(resolveSnapshotLocation(repo));
    // The published upper exists; the private temps it was captured/scratched in are torn down.
    expect(existsSync(location.upperDir)).toBe(true);

    const { upperDir, workDir } = backend.calls[0]?.overlayLayers ?? {};

    // A per-invocation mkdtemp name under dir, distinct from the published upper it was renamed onto.
    expect(upperDir?.startsWith(join(location.dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`))).toBe(true);
    expect(workDir?.startsWith(join(location.dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`))).toBe(true);
    expect(upperDir).not.toBe(location.upperDir);
    expect(existsSync(upperDir ?? "")).toBe(false);
    expect(existsSync(workDir ?? "")).toBe(false);
  });

  test("keeps a snapshot a concurrent capturer already published and drops its own temp upper", async () => {
    expect.hasAssertions();

    // Simulate the lost race: a populated final upper is already on disk before this capture publishes.
    const publishedUpper = resolveSnapshotLocation(repo).upperDir;
    mkdirSync(publishedUpper, { recursive: true });
    writeFileSync(join(publishedUpper, "marker"), "");

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    const { location } = await createSnapshot(backend, command, { cwd: repo, stdio: "pipe" });

    expect(location.exists).toBe(true);
    // Theirs is kept untouched; our own temp upper is discarded.
    expect(existsSync(join(publishedUpper, "marker"))).toBe(true);
    expect(existsSync(backend.calls[0]?.overlayLayers?.upperDir ?? "")).toBe(false);
  });

  test("returns the capture run's result so a cold-path fork reuses it instead of re-running", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    const { result } = await createSnapshot(backend, command, { cwd: repo, stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: "" });
  });

  test("preserves the caller's exec options while adding capture overlay layers", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    const store = join(repo, VIRRUN_STORE_DIRECTORY_NAME);
    await createSnapshot(backend, command, { bindDirs: [store], cwd: repo, isNetworkEnabled: true, stdio: "pipe" });

    expect(backend.calls[0]).toStrictEqual(
      expect.objectContaining({ bindDirs: [store], cwd: repo, isNetworkEnabled: true }),
    );
  });

  test("throws when the setup command fails so a half-installed upper is never reused", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(1), name: BackendType.Os };

    await expect(createSnapshot(backend, command, { cwd: repo, stdio: "pipe" })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, createSnapshot.name, "snapshot setup command exited with 1: ").message}]`,
    );
  });
});
