import { FIELD_SEPARATOR, GITHUB_OUTAGE_REGEX, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { describe, expect, test, vi } from "vitest";

describe("constants", () => {
  // The pattern is a claim about two tools' wording, so each row is a message the tool really prints
  test.each([
    {
      isOutage: true,
      message:
        "gh: No server is currently available to service your request. Sorry about that. Please try resubmitting your request and contact us if the problem persists. (HTTP 503)",
    },
    { isOutage: true, message: "HTTP 502: Bad Gateway (https://api.github.com/graphql)" },
    {
      isOutage: true,
      message: "fatal: unable to access 'https://github.com/Esposter/Esposter/': The requested URL returned error: 500",
    },
    { isOutage: false, message: "gh: Not Found (HTTP 404)" },
    { isOutage: false, message: "error: could not apply 0000000... fix: retry on HTTP 503" },
    {
      isOutage: false,
      message: "fatal: unable to access 'https://github.com/': The requested URL returned error: 403",
    },
  ])("the outage pattern reads $message as an outage: $isOutage", ({ isOutage, message }) => {
    expect.hasAssertions();

    expect(GITHUB_OUTAGE_REGEX.test(message)).toBe(isOutage);
  });

  // The escape is what the file may hold and the character is what the constant must be, and nothing else pins
  // The second: a `\u001E` mangled into `001E` still typechecks, still lints, and still splits a `git log` — on
  // A four-character delimiter that any subject could contain. `controlCharacters` holds the other half
  test.each([
    { expectedCodePoint: 0x1e, name: "RECORD_SEPARATOR", separator: RECORD_SEPARATOR },
    { expectedCodePoint: 0x1f, name: "FIELD_SEPARATOR", separator: FIELD_SEPARATOR },
  ])("$name is the one character it names", ({ expectedCodePoint, separator }) => {
    expect.hasAssertions();

    expect(separator).toHaveLength(1);
    expect(separator.codePointAt(0)).toBe(expectedCodePoint);
  });

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
