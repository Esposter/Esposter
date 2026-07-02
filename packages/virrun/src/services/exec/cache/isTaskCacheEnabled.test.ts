import { isTaskCacheEnabled } from "@/services/exec/cache/isTaskCacheEnabled";
import { CI_ENV_KEY, VIRRUN_NO_CACHE_KEY } from "@/services/exec/util/constants";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(isTaskCacheEnabled, () => {
  let previousCi: string | undefined;
  let previousNoCache: string | undefined;

  beforeEach(() => {
    previousCi = process.env[CI_ENV_KEY];
    previousNoCache = process.env[VIRRUN_NO_CACHE_KEY];
    delete process.env[CI_ENV_KEY];
    delete process.env[VIRRUN_NO_CACHE_KEY];
  });

  afterEach(() => {
    if (previousCi === undefined) delete process.env[CI_ENV_KEY];
    else process.env[CI_ENV_KEY] = previousCi;
    if (previousNoCache === undefined) delete process.env[VIRRUN_NO_CACHE_KEY];
    else process.env[VIRRUN_NO_CACHE_KEY] = previousNoCache;
  });

  test("is on by default when neither CI nor the opt-out is set", () => {
    expect.hasAssertions();

    expect(isTaskCacheEnabled()).toBe(true);
  });

  test("is off in CI so a zero-hit environment does not pay the source-hash cost", () => {
    expect.hasAssertions();

    process.env[CI_ENV_KEY] = "true";

    expect(isTaskCacheEnabled()).toBe(false);
  });

  test("treats an empty or falsy CI value as not-CI", () => {
    expect.hasAssertions();

    process.env[CI_ENV_KEY] = "false";

    expect(isTaskCacheEnabled()).toBe(true);
  });

  test("is off when the explicit opt-out is set", () => {
    expect.hasAssertions();

    process.env[VIRRUN_NO_CACHE_KEY] = "true";

    expect(isTaskCacheEnabled()).toBe(false);
  });
});
