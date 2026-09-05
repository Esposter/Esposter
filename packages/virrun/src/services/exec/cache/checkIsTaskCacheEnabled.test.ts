import { checkIsTaskCacheEnabled } from "#src/services/exec/cache/checkIsTaskCacheEnabled";
import { CI_ENV_KEY, VIRRUN_NO_CACHE_KEY } from "#src/services/exec/util/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(checkIsTaskCacheEnabled, () => {
  // The host may be running under either, and each case reads the default it names rather than the dev shell
  beforeEach(() => {
    vi.stubEnv(CI_ENV_KEY, undefined);
    vi.stubEnv(VIRRUN_NO_CACHE_KEY, undefined);
  });

  test("is on by default when neither CI nor the opt-out is set", () => {
    expect.hasAssertions();

    expect(checkIsTaskCacheEnabled()).toBe(true);
  });

  test("is off in CI so a zero-hit environment does not pay the source-hash cost", () => {
    expect.hasAssertions();

    vi.stubEnv(CI_ENV_KEY, "true");

    expect(checkIsTaskCacheEnabled()).toBe(false);
  });

  test("treats an empty or falsy CI value as not-CI", () => {
    expect.hasAssertions();

    vi.stubEnv(CI_ENV_KEY, "false");

    expect(checkIsTaskCacheEnabled()).toBe(true);
  });

  test("is off when the explicit opt-out is set", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_NO_CACHE_KEY, "true");

    expect(checkIsTaskCacheEnabled()).toBe(false);
  });
});
