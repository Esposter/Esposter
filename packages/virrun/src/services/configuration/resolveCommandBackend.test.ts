import { BackendType } from "@/models/virrun/BackendType";
import { resolveCommandBackend } from "@/services/configuration/resolveCommandBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/os/isOsBackendSupported"));

describe(resolveCommandBackend, () => {
  beforeEach(() => {
    // Default to a supported host; the fallback test flips this so routing decisions stay host-independent.
    vi.mocked(isOsBackendSupported).mockReturnValue(true);
  });

  test("runs native when there is no config", () => {
    expect.hasAssertions();

    expect(resolveCommandBackend(["vitest"], undefined)).toBe(BackendType.Native);
  });

  test("runs native when the command is not in the allowlist", () => {
    expect.hasAssertions();

    const configuration = { backend: BackendType.Os, fallback: BackendType.Native, route: ["pnpm install"] };

    expect(resolveCommandBackend(["vitest"], configuration)).toBe(BackendType.Native);
  });

  test("routes a matched command through the configured backend", () => {
    expect.hasAssertions();

    const configuration = { backend: BackendType.Os, fallback: BackendType.Native, route: ["vitest"] };

    expect(resolveCommandBackend(["vitest", "run"], configuration)).toBe(BackendType.Os);
  });

  test("defers an os route to the fallback when the host lacks bubblewrap support", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    const configuration = { backend: BackendType.Os, fallback: BackendType.Native, route: ["vitest"] };

    expect(resolveCommandBackend(["vitest"], configuration)).toBe(BackendType.Native);
  });

  test("defers to a non-native fallback when configured", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    // A non-native fallback locks the contract: the resolver returns `configuration.fallback`, not a hardcoded
    // Native, so an `os` route can degrade to `vfs` (or any other backend) rather than always native.
    const configuration = { backend: BackendType.Os, fallback: BackendType.Vfs, route: ["vitest"] };

    expect(resolveCommandBackend(["vitest"], configuration)).toBe(BackendType.Vfs);
  });
});
