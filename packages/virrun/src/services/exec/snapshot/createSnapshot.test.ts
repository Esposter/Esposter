import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { BackendType } from "@/models/virrun/BackendType";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { PNPM_LOCKFILE_FILENAME, VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];
let repo = "";

const createTemporaryDirectory = (): string => {
  const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  temporaryDirectories.push(dir);
  return dir;
};

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
  beforeEach(() => {
    process.env[VIRRUN_CACHE_HOME_KEY] = createTemporaryDirectory();
    repo = createTemporaryDirectory();
    writeFileSync(join(repo, PNPM_LOCKFILE_FILENAME), "lockfileVersion: '9.0'\n");
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    while (temporaryDirectories.length > 0) {
      const dir = temporaryDirectories.pop();
      if (dir !== undefined) rmSync(dir, { force: true, recursive: true });
    }
  });

  test("runs the setup command in capture mode and materializes the snapshot overlay dirs", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    const location = await createSnapshot(backend, "pnpm install", { cwd: repo, stdio: "pipe" });

    expect(location).toStrictEqual(resolveSnapshotLocation(repo));
    expect(existsSync(location.upperDir)).toBe(true);
    expect(existsSync(location.workDir)).toBe(true);
    expect(backend.calls[0]?.overlayLayers).toStrictEqual({
      upperDir: location.upperDir,
      workDir: location.workDir,
    });
  });

  test("preserves the caller's exec options while adding capture overlay layers", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    await createSnapshot(backend, "pnpm install", {
      bindDirs: [join(repo, "store")],
      cwd: repo,
      isNetworkEnabled: true,
      stdio: "pipe",
    });

    expect(backend.calls[0]).toStrictEqual(
      expect.objectContaining({ bindDirs: [join(repo, "store")], cwd: repo, isNetworkEnabled: true }),
    );
  });

  test("throws when the setup command fails so a half-installed upper is never reused", async () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(1), name: BackendType.Os };

    await expect(createSnapshot(backend, "pnpm install", { cwd: repo, stdio: "pipe" })).rejects.toThrow(
      "snapshot setup command exited with 1",
    );
  });
});
