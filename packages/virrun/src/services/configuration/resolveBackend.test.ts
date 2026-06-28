import { BackendType } from "@/models/virrun/BackendType";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/os/isOsBackendSupported"));

describe(resolveBackend, () => {
  beforeEach(() => {
    // Default to a supported host; the fallback tests flip this so backend decisions stay host-independent.
    vi.mocked(isOsBackendSupported).mockReturnValue(true);
  });

  test("defaults to auto when there is no config", () => {
    expect.hasAssertions();

    expect(resolveBackend(undefined)).toBe(BackendType.Auto);
  });

  test("runs the configured backend", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os, fallback: BackendType.Native })).toBe(BackendType.Os);
  });

  test("defers an os backend to the fallback when the host lacks bubblewrap support", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend({ backend: BackendType.Os, fallback: BackendType.Native })).toBe(BackendType.Native);
  });

  test("defers to a non-native fallback when configured", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    // A non-native fallback locks the contract: the resolver returns `configuration.fallback`, not a hardcoded
    // Native, so an `os` backend can degrade to `vfs` (or any other backend) rather than always native.
    expect(resolveBackend({ backend: BackendType.Os, fallback: BackendType.Vfs })).toBe(BackendType.Vfs);
  });
});
