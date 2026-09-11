import { SETUP_COMMAND_LINUX, SETUP_COMMAND_WIN32 } from "#src/services/exec/snapshot/constants";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { describe, expect, test } from "vitest";

describe(resolveSetupCommand, () => {
  const stubPlatform = setupPlatformStub();

  test("bootstraps pnpm through corepack inside the WSL sandbox on Windows", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    expect(resolveSetupCommand()).toBe(SETUP_COMMAND_WIN32);
  });

  test("invokes the caller-provided pnpm directly on Linux", () => {
    expect.hasAssertions();

    stubPlatform("linux");

    expect(resolveSetupCommand()).toBe(SETUP_COMMAND_LINUX);
  });
});
