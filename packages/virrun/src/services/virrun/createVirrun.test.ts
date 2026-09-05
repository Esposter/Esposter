import type { ExecResult } from "#src/models/exec/ExecResult";
import type { SnapshotLocation } from "#src/models/exec/snapshot/SnapshotLocation";

import { SourceType } from "#src/models/source/SourceType";
import { BackendType } from "#src/models/virrun/BackendType";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { createSnapshot } from "#src/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "#src/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { createRecordingBackend } from "#src/services/exec/test/createRecordingBackend.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { TEST_WSL_CACHE_DIR_NAME } from "#src/services/exec/wsl/constants.test";
import { createVirrun } from "#src/services/virrun/createVirrun";
import { takeOne } from "@esposter/shared";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// Mock the os backend factory so the network/store wiring can be asserted without bubblewrap on the host.
vi.mock(import("#src/services/exec/os/createOsBackend"));
// Mock the snapshot layer so the cold/warm fork provisioning is asserted without a real install:
// `resolveSnapshotLocation` drives the branch, the other two are spied.
vi.mock(import("#src/services/exec/snapshot/createSnapshot"));
vi.mock(import("#src/services/exec/snapshot/forkSnapshot"));
vi.mock(import("#src/services/exec/snapshot/resolveSnapshotLocation"));
// Mock the WSL login-PATH capture: the real one spawns wsl.exe on win32, which this mocked-backend test mustn't
// Depend on. The shared capture, never an empty one — createOsExecOptions reads an empty path on win32 as a failed
// Capture and throws, which every os-backend case here would then die on.
vi.mock(import("#src/services/exec/wsl/readWslLoginEnvironment"), async () => {
  const { TEST_WSL_LOGIN_ENVIRONMENT: testWslLoginEnvironment } = await import("#src/services/exec/wsl/constants.test");
  return { readWslLoginEnvironment: () => testWslLoginEnvironment };
});
// And the path translation those options reach for on win32: a non-empty login capture puts createOsExecOptions on
// The win32 branch, which resolves the source mirror through readWslPath — the real one spawns wsl.exe, so mocking
// Only the capture above left this suite still depending on a live distro answering inside the test timeout.
vi.mock(import("#src/services/exec/wsl/readWslPath"), async () => {
  const { TEST_WSL_PREFIX: testWslPrefix } = await import("#src/services/exec/wsl/constants.test");
  return { readWslPath: (path: string) => `${testWslPrefix}${path}` };
});
// Same for the WSL native cache root: the real one spawns wsl.exe and would create dirs in the live WSL home.
// Point it at an in-temp dir.
vi.mock(import("#src/services/exec/wsl/getWslNativeCacheRoot"), async () => {
  const { tmpdir: osTmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  const { TEST_WSL_CACHE_DIR_NAME: testWslCacheDirName } = await import("#src/services/exec/wsl/constants.test");
  return { getWslNativeCacheRoot: () => joinPath(osTmpdir(), testWslCacheDirName) };
});

const mockOsBackend = () =>
  vi.mocked(createOsBackend).mockReturnValue({
    exec: (): Promise<ExecResult> => Promise.resolve({ exitCode: 0, stderr: "", stdout: "" }),
    name: BackendType.Os,
  });
const snapshotLocation = (exists: boolean, dir: string): SnapshotLocation => ({
  dir,
  exists,
  hash: TEST_FILENAME,
  upperDir: TEST_FILENAME,
});

describe(createVirrun, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();

  beforeEach(() => {
    // Clear call counts between tests so the warm-snapshot case never sees the cold case's capture call.
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    // The mocked WSL native cache root lands the os-path store/corepack mkdirs under temp on win32; clean it up.
    rmSync(join(tmpdir(), TEST_WSL_CACHE_DIR_NAME), { force: true, recursive: true });
  });

  test("runs the command and captures its result", async () => {
    expect.hasAssertions();

    const { dispose, exec } = await createVirrun();
    const result = await exec(`node -e "process.stdout.write('${TEST_FILENAME}')"`);
    await dispose();

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
  });

  test("injects the VIRRUN presence signal into the command environment", async () => {
    expect.hasAssertions();

    const command = `node -e "process.stdout.write(process.env.VIRRUN ?? '${TEST_FILENAME}')"`;
    const { dispose, exec } = await createVirrun();
    const { stdout } = await exec(command);
    await dispose();

    expect(stdout).toBe("true");
  });

  test("defaults to the native backend", async () => {
    expect.hasAssertions();

    const { backend, dispose } = await createVirrun();
    await dispose();

    expect(backend).toBe(BackendType.Native);
  });

  test("enables network for the os backend so pnpm can reach the registry", async () => {
    expect.hasAssertions();

    // `--unshare-all` drops the network namespace; without re-enabling it pnpm dies bootstrapping its config
    // Dependencies ("fetch failed") before the real command runs. The os backend isolates the filesystem, not
    // The network — so the orchestrator must turn it back on.
    const backend = createRecordingBackend();
    vi.mocked(createOsBackend).mockReturnValue(backend);
    // The os path anchors its shared store to the workspace root (nearest lockfile), so use a lockfile-seeded dir.
    const dir = createWorkspace();
    const { dispose, exec } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    await exec("pnpm install");
    await dispose();

    expect(takeOne(backend.calls).isNetworkEnabled).toBe(true);
  });

  test("fork falls through to exec on a non-os backend, with no snapshot layer", async () => {
    expect.hasAssertions();

    // Pin a non-os backend explicitly so this stays on the fallback branch even if Auto later resolves to Os.
    const { dispose, fork } = await createVirrun({ backend: BackendType.Native });
    const result = await fork(`node -e "process.stdout.write('${TEST_FILENAME}')"`);
    await dispose();

    // Fork on a non-os backend is a plain exec — no snapshot capture, the command's result passes straight through.
    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    expect(createSnapshot).not.toHaveBeenCalled();
    expect(forkSnapshot).not.toHaveBeenCalled();
  });

  test("fork provisions the dependency snapshot on a cold cache, then runs the command over it", async () => {
    expect.hasAssertions();

    mockOsBackend();
    const snapshotDirectory = create();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(false, snapshotDirectory));
    vi.mocked(createSnapshot).mockResolvedValue({
      location: snapshotLocation(true, snapshotDirectory),
      result: { exitCode: 0, stderr: "", stdout: "" },
    });
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    const dir = createWorkspace();
    const { dispose, fork } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    const result = await fork("tsc");
    await dispose();

    expect(createSnapshot).toHaveBeenCalledTimes(1);
    expect(forkSnapshot).toHaveBeenCalledTimes(1);
    expect(result.stdout).toBe(TEST_FILENAME);
  });

  test("fork reuses a warm snapshot without reinstalling", async () => {
    expect.hasAssertions();

    mockOsBackend();
    const snapshotDirectory = create();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(true, snapshotDirectory));
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    const dir = createWorkspace();
    const { dispose, fork } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    await fork("tsc");
    await dispose();

    expect(createSnapshot).not.toHaveBeenCalled();
    expect(forkSnapshot).toHaveBeenCalledTimes(1);
  });

  test("leases the snapshot for the run so a concurrent prune can't evict it, and releases it on dispose", async () => {
    expect.hasAssertions();

    mockOsBackend();
    const snapshotDirectory = create();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(true, snapshotDirectory));
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    const dir = createWorkspace();
    const { dispose, fork } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    await fork("tsc");

    const leaseFile = join(snapshotDirectory, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME, String(process.pid));

    expect(existsSync(leaseFile)).toBe(true);

    await dispose();

    expect(existsSync(leaseFile)).toBe(false);
  });
});
