import { BackendType } from "@/models/virrun/BackendType";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/os/isOsBackendSupported"));

describe(resolveBackend, () => {
  beforeEach(() => {
    // Default to a supported host; the degrade tests flip this so backend decisions stay host-independent.
    vi.mocked(isOsBackendSupported).mockReturnValue(true);
  });

  test("defaults to auto when there is no config", () => {
    expect.hasAssertions();

    expect(resolveBackend(undefined)).toBe(BackendType.Auto);
  });

  test("runs the configured backend", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os })).toBe(BackendType.Os);
  });

  test("degrades an os backend to native when the host lacks bubblewrap support", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    // Native is the only universally-available backend, so an unsupported `os` always degrades to it — there is
    // No configurable target. This keeps the "never errors the build" contract: worst case is "no speedup".
    expect(resolveBackend({ backend: BackendType.Os })).toBe(BackendType.Native);
  });

  test("leaves a non-os backend untouched on an unsupported host", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    // The host-support degrade only fires for `os` — every other backend runs as configured regardless of host.
    expect(resolveBackend({ backend: BackendType.Vfs })).toBe(BackendType.Vfs);
  });
});
