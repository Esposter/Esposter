import type { ExecResult } from "@/models/exec/ExecResult";

import { createVirrun } from "@/services/virrun/createVirrun";
import { spawn } from "node:child_process";
import { constants } from "node:os";
import { describe, expect, test } from "vitest";
// Baseline runner: execute the command natively, bypassing the sandbox entirely. The differential
// Gate (specs/correctness.md) asserts the sandbox produces a byte-identical ExecResult. With the
// Native passthrough backend this is trivially true — the test exists so the harness is already in
// Place to catch divergence the moment a real virtualizing backend lands.
const runNative = (command: string): Promise<ExecResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
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

  test("defaults to the native backend", async () => {
    expect.hasAssertions();

    const { backend, dispose } = await createVirrun();
    await dispose();

    expect(backend).toBe("native");
  });
});
