import { describe, expect, test, vi } from "vitest";

describe("constants", () => {
  // Each row is a platform the others never run on: node runs the `pnpm.cjs` corepack ships on Linux, the native
  // Binary runs itself on Windows, and a script outside `pnpm run` falls back to the `pnpm` on PATH
  test.each([
    { expectedArgs: ["pnpm.cjs"], expectedFile: process.execPath, npmExecPath: "pnpm.cjs" },
    { expectedArgs: [], expectedFile: "pnpm.exe", npmExecPath: "pnpm.exe" },
    { expectedArgs: [], expectedFile: "pnpm", npmExecPath: undefined },
  ])("resolves pnpm from npm_execpath=$npmExecPath", async ({ expectedArgs, expectedFile, npmExecPath }) => {
    expect.hasAssertions();

    vi.stubEnv("npm_execpath", npmExecPath);
    vi.resetModules();
    const { PNPM_ARGS, PNPM_FILE } = await import("#src/services/shared/constants");

    expect(PNPM_FILE).toBe(expectedFile);
    expect(PNPM_ARGS).toStrictEqual(expectedArgs);
  });
});
