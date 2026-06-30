import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { TEST_WSL_CACHE_DIR_NAME } from "@/services/exec/wsl/constants.test";
import { createVirrun } from "@/services/virrun/createVirrun";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// Mock the os backend factory so the network/store wiring can be asserted without bubblewrap on the host.
vi.mock(import("@/services/exec/os/createOsBackend"));
// Mock the snapshot layer so the fork provisioning logic (capture-on-cold, reuse-on-warm) can be asserted
// Without a real install: resolveSnapshotLocation drives the cold/warm branch, the other two are spied.
vi.mock(import("@/services/exec/snapshot/createSnapshot"));
vi.mock(import("@/services/exec/snapshot/forkSnapshot"));
vi.mock(import("@/services/exec/snapshot/resolveSnapshotLocation"));
// Mock the WSL login-PATH capture so the os-backend wiring assertions stay pure and platform-independent: the
// Real implementation spawns wsl.exe on win32, which a mocked-backend orchestration test must not depend on.
vi.mock(import("@/services/exec/wsl/readWslLoginPath"), () => ({ readWslLoginPath: () => "" }));
// Same reason for the WSL native cache root: on win32 the real one spawns wsl.exe and would create dirs in the
// Live WSL home. Point it at an in-temp dir so the store/corepack mkdirs are harmless and platform-independent.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { TEST_WSL_CACHE_DIR_NAME } = await import("@/services/exec/wsl/constants.test");
  return { getWslNativeCacheRoot: () => join(tmpdir(), TEST_WSL_CACHE_DIR_NAME) };
});

const mockOsBackend = () =>
  vi.mocked(createOsBackend).mockReturnValue({
    exec: (): Promise<ExecResult> => Promise.resolve({ exitCode: 0, stderr: "", stdout: "" }),
    name: BackendType.Os,
  });
const snapshotLocation = (exists: boolean): SnapshotLocation => ({
  dir: "",
  exists,
  hash: TEST_FILENAME,
  upperDir: TEST_FILENAME,
});

describe(createVirrun, () => {
  const { cleanup, createWorkspace } = createTemporaryDirectoryTracker();

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
    const calls: ExecOptions[] = [];
    vi.mocked(createOsBackend).mockReturnValue({
      exec: (_command, options): Promise<ExecResult> => {
        calls.push(options);
        return Promise.resolve({ exitCode: 0, stderr: "", stdout: "" });
      },
      name: BackendType.Os,
    });
    // The os path anchors its shared store to the workspace root (nearest lockfile), so use a lockfile-seeded dir.
    const dir = createWorkspace();
    const { dispose, exec } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    await exec("pnpm install");
    await dispose();

    expect(calls[0]).toStrictEqual(expect.objectContaining({ isNetworkEnabled: true }));
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
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(false));
    vi.mocked(createSnapshot).mockResolvedValue({
      location: snapshotLocation(true),
      result: { exitCode: 0, stderr: "", stdout: "" },
    });
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    const dir = createWorkspace();
    const { dispose, fork } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    const result = await fork("tsgo");
    await dispose();

    expect(createSnapshot).toHaveBeenCalledTimes(1);
    expect(forkSnapshot).toHaveBeenCalledTimes(1);
    expect(result.stdout).toBe(TEST_FILENAME);
  });

  test("fork reuses a warm snapshot without reinstalling", async () => {
    expect.hasAssertions();

    mockOsBackend();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(true));
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: TEST_FILENAME });
    const dir = createWorkspace();
    const { dispose, fork } = await createVirrun({
      backend: BackendType.Os,
      source: { dir, type: SourceType.Dir },
    });
    await fork("tsgo");
    await dispose();

    expect(createSnapshot).not.toHaveBeenCalled();
    expect(forkSnapshot).toHaveBeenCalledTimes(1);
  });
});
