import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { VIRRUN_FORCE_PROBE_KEY } from "#src/services/exec/util/constants";
import { createProbeCache } from "#src/services/exec/util/createProbeCache";
import { getHostFingerprint } from "#src/services/exec/util/getHostFingerprint";
import { describe, expect, test, vi } from "vitest";

type WritePersistedCache = (cache: Pick<KeyedCache<string>, "key" | "value">) => undefined;

describe(createProbeCache, () => {
  const value = "value";

  test("probes once on a cold cache, memoizes, and persists the fingerprint-keyed value", () => {
    expect.hasAssertions();

    const probe = vi.fn<() => string>(() => value);
    const writePersistedCache = vi.fn<WritePersistedCache>(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => undefined,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(readValue()).toBe(value);
    expect(readValue()).toBe(value);
    expect(probe).toHaveBeenCalledExactlyOnceWith();
    expect(writePersistedCache).toHaveBeenCalledExactlyOnceWith({ key: getHostFingerprint(), value });
  });

  test("reuses the persisted value without probing or re-persisting", () => {
    expect.hasAssertions();

    const probe = vi.fn<() => string>(() => value);
    const writePersistedCache = vi.fn<WritePersistedCache>(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => value,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(readValue()).toBe(value);
    expect(probe).not.toHaveBeenCalled();
    expect(writePersistedCache).not.toHaveBeenCalled();
  });

  test("force-probe bypasses the persisted cache but never the memo", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_FORCE_PROBE_KEY, "1");
    const probe = vi.fn<() => string>(() => value);
    const readPersistedCache = vi.fn<(key: string) => string | undefined>(() => value);
    const readValue = createProbeCache({
      probe,
      readPersistedCache,
      shouldPersist: () => true,
      writePersistedCache: () => undefined,
    });

    expect(readValue()).toBe(value);
    expect(readValue()).toBe(value);
    expect(readPersistedCache).not.toHaveBeenCalled();
    expect(probe).toHaveBeenCalledExactlyOnceWith();
  });

  test("does not persist a value shouldPersist rejects", () => {
    expect.hasAssertions();

    const writePersistedCache = vi.fn<WritePersistedCache>(() => undefined);
    const readValue = createProbeCache({
      probe: () => "",
      readPersistedCache: () => undefined,
      shouldPersist: Boolean,
      writePersistedCache,
    });

    expect(readValue()).toBe("");
    expect(writePersistedCache).not.toHaveBeenCalled();
  });

  test("a throwing probe leaves both tiers unset, so the next call re-probes", () => {
    expect.hasAssertions();

    const probe = vi.fn<() => string>(() => {
      throw new Error("probe failed");
    });
    const writePersistedCache = vi.fn<WritePersistedCache>(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => undefined,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(() => readValue()).toThrowErrorMatchingInlineSnapshot(`[Error: probe failed]`);
    expect(() => readValue()).toThrowErrorMatchingInlineSnapshot(`[Error: probe failed]`);
    expect(probe).toHaveBeenCalledTimes(2);
    expect(writePersistedCache).not.toHaveBeenCalled();
  });
});
