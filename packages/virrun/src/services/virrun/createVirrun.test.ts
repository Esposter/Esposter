import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import { createVirrun } from "@/services/virrun/createVirrun";
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { constants } from "node:os";
import { beforeEach, describe, expect, test, vi } from "vitest";
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

const mockOsBackend = () =>
  vi.mocked(createOsBackend).mockReturnValue({
    exec: (): Promise<ExecResult> => Promise.resolve({ exitCode: 0, stderr: "", stdout: "" }),
    name: BackendType.Os,
  });
const snapshotLocation = (exists: boolean): SnapshotLocation => ({ dir: "", exists, hash: "hash", upperDir: "upper" });

beforeEach(() => {
  // Clear call counts between tests so the warm-snapshot case never sees the cold case's capture call.
  vi.clearAllMocks();
});

// Baseline runner: execute the command natively, bypassing the sandbox entirely. The differential
// Gate (specs/correctness.md) asserts the sandbox produces a byte-identical ExecResult. With the
// Native passthrough backend this is trivially true — the test exists so the harness is already in
// Place to catch divergence the moment a real virtualizing backend lands.
const runNative = (command: string): Promise<ExecResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      resolve({ exitCode: code ?? (signal ? 128 + constants.signals[signal] : 0), stderr, stdout });
    });
  });

describe(createVirrun, () => {
  test("produces a result identical to running the command natively", async () => {
    expect.hasAssertions();

    const command = `node -e "process.stdout.write('hello')"`;
    const { dispose, exec } = await createVirrun();
    const sandboxResult = await exec(command);
    const nativeResult = await runNative(command);
    await dispose();

    expect(sandboxResult).toStrictEqual(nativeResult);
  });

  test("injects the VIRRUN presence signal into the command environment", async () => {
    expect.hasAssertions();

    const command = `node -e "process.stdout.write(process.env.VIRRUN ?? 'unset')"`;
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
    const dir = createWorkspaceDir();
    const { dispose, exec } = await createVirrun({ backend: BackendType.Os, source: { dir, type: SourceType.Dir } });
    await exec("pnpm install");
    await dispose();
    rmSync(dir, { force: true, recursive: true });

    expect(calls[0]).toStrictEqual(expect.objectContaining({ isNetworkEnabled: true }));
  });

  test("fork falls through to exec on a non-os backend, with no snapshot layer", async () => {
    expect.hasAssertions();

    const command = `node -e "process.stdout.write('forked')"`;
    // Pin a non-os backend explicitly so this stays on the fallback branch even if Auto later resolves to Os.
    const { dispose, fork } = await createVirrun({ backend: BackendType.Native });
    const forkResult = await fork(command);
    const nativeResult = await runNative(command);
    await dispose();

    expect(forkResult).toStrictEqual(nativeResult);
  });

  test("fork provisions the dependency snapshot on a cold cache, then runs the command over it", async () => {
    expect.hasAssertions();

    mockOsBackend();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(false));
    vi.mocked(createSnapshot).mockResolvedValue({
      location: snapshotLocation(true),
      result: { exitCode: 0, stderr: "", stdout: "" },
    });
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "forked" });
    const dir = createWorkspaceDir();
    const { dispose, fork } = await createVirrun({ backend: BackendType.Os, source: { dir, type: SourceType.Dir } });
    const result = await fork("tsgo");
    await dispose();
    rmSync(dir, { force: true, recursive: true });

    expect(createSnapshot).toHaveBeenCalledOnceWith();
    expect(forkSnapshot).toHaveBeenCalledOnceWith();
    expect(result.stdout).toBe("forked");
  });

  test("fork reuses a warm snapshot without reinstalling", async () => {
    expect.hasAssertions();

    mockOsBackend();
    vi.mocked(resolveSnapshotLocation).mockReturnValue(snapshotLocation(true));
    vi.mocked(forkSnapshot).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "forked" });
    const dir = createWorkspaceDir();
    const { dispose, fork } = await createVirrun({ backend: BackendType.Os, source: { dir, type: SourceType.Dir } });
    await fork("tsgo");
    await dispose();
    rmSync(dir, { force: true, recursive: true });

    expect(createSnapshot).not.toHaveBeenCalled();
    expect(forkSnapshot).toHaveBeenCalledOnceWith();
  });
});
