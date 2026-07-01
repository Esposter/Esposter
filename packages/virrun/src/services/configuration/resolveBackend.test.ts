import { BackendType } from "@/models/virrun/BackendType";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/os/isOsBackendSupported"));

describe(resolveBackend, () => {
  // Pass an explicit empty env so the suite is hermetic: `pnpm test` runs under `virrun -- vitest`, so the real
  // Process env already carries the VIRRUN signal the nesting guard reads.
  const env: NodeJS.ProcessEnv = {};

  beforeEach(() => {
    // Default to a supported host; the degrade tests flip this so backend decisions stay host-independent.
    vi.mocked(isOsBackendSupported).mockReturnValue(true);
  });

  test("defaults to auto when there is no config", () => {
    expect.hasAssertions();

    expect(resolveBackend(undefined, env)).toBe(BackendType.Auto);
  });

  test("runs the configured backend", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os }, env)).toBe(BackendType.Os);
  });

  test("degrades an os backend to native when the host lacks bubblewrap support", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend({ backend: BackendType.Os }, env)).toBe(BackendType.Native);
  });

  test("leaves a non-os backend untouched on an unsupported host", () => {
    expect.hasAssertions();

    vi.mocked(isOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend({ backend: BackendType.Vfs }, env)).toBe(BackendType.Vfs);
  });

  test("degrades to native when nested inside another virrun sandbox to avoid writing the read-only cache", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os }, { [VIRRUN_ENV_KEY]: "true" })).toBe(BackendType.Native);
  });
});
