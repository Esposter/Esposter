import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Mirrors the implementation's probe — bwrap present AND able to set up the RAM overlay — so the positive
// Assertion only runs where the os backend genuinely works (an overlay-capable dev box), not a bare CI
// Runner nor a host whose bubblewrap lacks overlayfs support (e.g. some WSL2 builds).
const isOverlayCapable =
  process.platform === "linux" &&
  getResult(() =>
    execFileSync("bwrap", buildBwrapArgs("true", mkdtempSync(join(tmpdir(), "os-support-test-"))), {
      stdio: "pipe",
    }),
  ).match(
    () => true,
    () => false,
  );

describe(isOsBackendSupported, () => {
  test.skipIf(process.platform === "linux")("is false on non-Linux hosts", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(false);
  });

  test.skipIf(!isOverlayCapable)("is true on a host with overlay-capable bubblewrap", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });
});
