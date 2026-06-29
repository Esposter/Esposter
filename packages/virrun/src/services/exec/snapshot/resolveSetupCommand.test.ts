import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { afterEach, describe, expect, test } from "vitest";

const realPlatform = process.platform;
const setPlatform = (platform: NodeJS.Platform) =>
  Object.defineProperty(process, "platform", { configurable: true, value: platform });

describe(resolveSetupCommand, () => {
  afterEach(() => {
    setPlatform(realPlatform);
  });

  test("bootstraps pnpm through corepack inside the WSL sandbox on Windows", () => {
    expect.hasAssertions();

    setPlatform("win32");

    expect(resolveSetupCommand()).toBe("corepack pnpm install --frozen-lockfile");
  });

  test("invokes the caller-provided pnpm directly on Linux", () => {
    expect.hasAssertions();

    setPlatform("linux");

    expect(resolveSetupCommand()).toBe("pnpm install --frozen-lockfile");
  });
});
