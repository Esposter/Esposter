import { BackendType } from "#src/models/virrun/BackendType";
import { resolveBackend } from "#src/services/configuration/resolveBackend";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { VIRRUN_ENV_KEY } from "#src/services/exec/util/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/os/checkIsOsBackendSupported"));

describe(resolveBackend, () => {
  // Pass an explicit empty env so the suite is hermetic: `pnpm test` runs under `virrun -- vitest`, so the real
  // Process env already carries the VIRRUN signal the nesting guard reads.
  const env: NodeJS.ProcessEnv = {};

  beforeEach(() => {
    // Default to a supported host; the degrade tests flip this so backend decisions stay host-independent.
    vi.mocked(checkIsOsBackendSupported).mockReturnValue(true);
  });

  test(`defaults to ${BackendType.Os} when there is no config`, () => {
    expect.hasAssertions();

    expect(resolveBackend(undefined, env)).toBe(BackendType.Os);
  });

  test(`defaults to ${BackendType.Os} when the config omits a backend`, () => {
    expect.hasAssertions();

    expect(resolveBackend({}, env)).toBe(BackendType.Os);
  });

  test(`degrades the default ${BackendType.Os} backend to ${BackendType.Native} when the host lacks bubblewrap support`, () => {
    expect.hasAssertions();

    vi.mocked(checkIsOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend(undefined, env)).toBe(BackendType.Native);
  });

  test("runs the configured backend", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os }, env)).toBe(BackendType.Os);
  });

  test("degrades an os backend to native when the host lacks bubblewrap support", () => {
    expect.hasAssertions();

    vi.mocked(checkIsOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend({ backend: BackendType.Os }, env)).toBe(BackendType.Native);
  });

  test("leaves a non-os backend untouched on an unsupported host", () => {
    expect.hasAssertions();

    vi.mocked(checkIsOsBackendSupported).mockReturnValue(false);

    expect(resolveBackend({ backend: BackendType.Vfs }, env)).toBe(BackendType.Vfs);
  });

  test("degrades to native when nested inside another virrun sandbox to avoid writing the read-only cache", () => {
    expect.hasAssertions();

    expect(resolveBackend({ backend: BackendType.Os }, { [VIRRUN_ENV_KEY]: "true" })).toBe(BackendType.Native);
  });
});
