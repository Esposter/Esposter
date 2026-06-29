import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { createVirrun } from "@/services/virrun/createVirrun";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { constants, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
// Mock the os backend factory so the network/store wiring can be asserted without bubblewrap on the host.
vi.mock(import("@/services/exec/os/createOsBackend"));
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
    const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
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
});
