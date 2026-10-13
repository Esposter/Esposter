import type { execFile as baseExecFile } from "node:child_process";

import { execFile } from "#src/services/childProcess/execFile";
import { promisify } from "node:util";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { nodeFunction, nodePromisified } = vi.hoisted(() => ({
  nodeFunction: vi.fn<typeof baseExecFile>(),
  nodePromisified: vi.fn<(...parameters: unknown[]) => Promise<{ stderr: string; stdout: string }>>(),
}));

vi.mock(import("node:child_process"), async () => {
  const { promisify: promisifyCustom } = await import("node:util");
  return {
    execFile: Object.assign(nodeFunction, {
      [promisifyCustom.custom]: nodePromisified,
    }) as unknown as typeof baseExecFile,
  };
});

describe(execFile, () => {
  const file = "file";
  const args = ["argument"];

  beforeEach(() => {
    nodeFunction.mockReset();
    nodePromisified.mockReset();
  });

  test("hides the window when the caller passes no options", () => {
    expect.hasAssertions();

    execFile(file, args);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });

  test("keeps the caller's options and hides the window last", () => {
    expect.hasAssertions();

    execFile(file, args, { cwd: file });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { cwd: file, windowsHide: true });
  });

  test("hides the window ahead of a trailing callback when the caller passes no options", () => {
    expect.hasAssertions();

    const callback = vi.fn<() => void>();

    execFile(file, args, callback);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true }, callback);
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    execFile(file, args, { windowsHide: false });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });

  test("promisified, resolves node's stdout and stderr with the window hidden", async () => {
    expect.hasAssertions();

    const output = { stderr: "", stdout: file };
    nodePromisified.mockResolvedValueOnce(output);

    await expect(promisify(execFile)(file, args)).resolves.toStrictEqual(output);
    expect(nodePromisified).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });
});
