import { createProbeCache } from "@/services/exec/util/createProbeCache";
import { VIRRUN_FORCE_PROBE_KEY } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createProbeCache, () => {
  const value = "value";

  afterEach(() => {
    delete process.env[VIRRUN_FORCE_PROBE_KEY];
  });

  test("probes once on a cold cache, memoizes, and persists the fingerprint-keyed value", () => {
    expect.hasAssertions();

    const probe = vi.fn(() => value);
    const writePersistedCache = vi.fn(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => undefined,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(readValue()).toBe(value);
    expect(readValue()).toBe(value);
    expect(probe).toHaveBeenCalledTimes(1);
    expect(writePersistedCache).toHaveBeenCalledExactlyOnceWith({ key: getHostFingerprint(), value });
  });

  test("reuses the persisted value without probing or re-persisting", () => {
    expect.hasAssertions();

    const probe = vi.fn(() => value);
    const writePersistedCache = vi.fn(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => value,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(readValue()).toBe(value);
    expect(probe).toHaveBeenCalledTimes(0);
    expect(writePersistedCache).toHaveBeenCalledTimes(0);
  });

  test("force-probe bypasses the persisted cache but never the memo", () => {
    expect.hasAssertions();

    process.env[VIRRUN_FORCE_PROBE_KEY] = "1";
    const probe = vi.fn(() => value);
    const readPersistedCache = vi.fn(() => value);
    const readValue = createProbeCache({
      probe,
      readPersistedCache,
      shouldPersist: () => true,
      writePersistedCache: () => undefined,
    });

    expect(readValue()).toBe(value);
    expect(readValue()).toBe(value);
    expect(readPersistedCache).toHaveBeenCalledTimes(0);
    expect(probe).toHaveBeenCalledTimes(1);
  });

  test("does not persist a value shouldPersist rejects", () => {
    expect.hasAssertions();

    const writePersistedCache = vi.fn(() => undefined);
    const readValue = createProbeCache({
      probe: () => "",
      readPersistedCache: () => undefined,
      shouldPersist: Boolean,
      writePersistedCache,
    });

    expect(readValue()).toBe("");
    expect(writePersistedCache).toHaveBeenCalledTimes(0);
  });

  test("a throwing probe leaves both tiers unset, so the next call re-probes", () => {
    expect.hasAssertions();

    const probe = vi.fn<() => string>(() => {
      throw new Error("probe failed");
    });
    const writePersistedCache = vi.fn(() => undefined);
    const readValue = createProbeCache({
      probe,
      readPersistedCache: () => undefined,
      shouldPersist: () => true,
      writePersistedCache,
    });

    expect(() => readValue()).toThrowErrorMatchingInlineSnapshot(`[Error: probe failed]`);
    expect(() => readValue()).toThrowErrorMatchingInlineSnapshot(`[Error: probe failed]`);
    expect(probe).toHaveBeenCalledTimes(2);
    expect(writePersistedCache).toHaveBeenCalledTimes(0);
  });
});
