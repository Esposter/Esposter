import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { getResult } from "@esposter/shared";
import { execSync } from "node:child_process";
import { describe, expect, test } from "vitest";

// Mirrors the implementation's `command -v bwrap` so the positive assertion only runs where bubblewrap
// Is genuinely installed (the dev box, not bare CI).
const isBubblewrapInstalled =
  process.platform === "linux" &&
  getResult(() => execSync("command -v bwrap", { stdio: "pipe" })).match(
    () => true,
    () => false,
  );

describe(isOsBackendSupported, () => {
  test.skipIf(process.platform === "linux")("is false on non-Linux hosts", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(false);
  });

  test.skipIf(!isBubblewrapInstalled)("is true on Linux with bubblewrap installed", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });
});
