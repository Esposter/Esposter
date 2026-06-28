import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { BackendType } from "@/models/virrun/BackendType";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { PNPM_LOCKFILE_FILENAME, VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  test("stacks the captured upper as the sole overlay lower and runs the command", async () => {
    expect.hasAssertions();

    const { upperDir } = resolveSnapshotLocation(repo);
    mkdirSync(upperDir, { recursive: true });
    const backend = { ...createFakeBackend(), name: BackendType.Os };
    const { stdout } = await forkSnapshot(backend, "vitest", { cwd: repo, stdio: "pipe" });

    expect(stdout).toBe("forked");
    expect(backend.calls[0]?.overlayLayers).toStrictEqual({ lowerDirs: [upperDir] });
  });

  test("throws when no snapshot has been captured yet", () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(), name: BackendType.Os };

    expect(() => forkSnapshot(backend, "vitest", { cwd: repo, stdio: "pipe" })).toThrow("no captured snapshot to fork");
  });
});
