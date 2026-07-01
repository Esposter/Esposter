import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { getResult, withFinalizer } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { describe, expect, test } from "vitest";

// Mirrors the implementation's probe - bwrap present AND able to set up the RAM overlay on the real working dir - so
// The positive assertion only runs where the os backend genuinely works (an overlay-capable dev box running the suite
// UN-nested), not a bare CI runner, a host whose bubblewrap lacks overlayfs support (e.g. some WSL2 builds), nor a run
// Nested inside the os-backend sandbox (`virrun -- vitest`), where overlaying the already-overlaid cwd is rejected.
const isOverlayCapable =
  process.platform === "linux" &&
  getResult(() => execFileSync("bwrap", buildBwrapArgs(["true"], process.cwd()), { stdio: "pipe" })).match(
    () => true,
    () => false,
  );
const isWslOverlayCapable =
  process.platform === "win32" &&
  getResult(() => execFileSync("wsl.exe", ["--exec", "mktemp", "-d"], { stdio: "pipe" }))
    .map((stdout) => stdout.toString().trim())
    .andThen((wslDir) =>
      getResult(() =>
        withFinalizer(
          () => execFileSync("wsl.exe", ["--exec", "bwrap", ...buildBwrapArgs(["true"], wslDir)], { stdio: "pipe" }),
          () => {
            getResult(() => execFileSync("wsl.exe", ["--exec", "rm", "-rf", wslDir], { stdio: "pipe" })).unwrapOr(
              undefined,
            );
          },
        ),
      ),
    )
    .match(
      () => true,
      () => false,
    );

describe(isOsBackendSupported, () => {
  test.skipIf(process.platform === "linux" || isWslOverlayCapable)(
    "is false on hosts without Linux or WSL support",
    () => {
      expect.hasAssertions();

      expect(isOsBackendSupported()).toBe(false);
    },
  );

  test.skipIf(!isOverlayCapable)("is true on a host with overlay-capable bubblewrap", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });

  test.skipIf(!isWslOverlayCapable)("is true on a Windows host with overlay-capable WSL bubblewrap", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });
});
