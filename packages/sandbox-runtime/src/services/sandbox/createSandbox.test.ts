import type { ExecResult } from "@/models/exec/ExecResult";

import { createSandbox } from "@/services/sandbox/createSandbox";
import { spawn } from "node:child_process";
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
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 0, stderr, stdout });
    });
  });

describe(createSandbox, () => {
  test("produces a result identical to running the command natively", async () => {
    expect.hasAssertions();

    const command = `node -e "process.stdout.write('hello')"`;
    const { dispose, exec } = await createSandbox();
    const sandboxResult = await exec(command);
    const nativeResult = await runNative(command);
    await dispose();

    expect(sandboxResult).toStrictEqual(nativeResult);
  });

  test("defaults to the native backend", async () => {
    expect.hasAssertions();

    const { backend, dispose } = await createSandbox();
    await dispose();

    expect(backend).toBe("native");
  });
});
