import { afterEach, describe, expect, test, vi } from "vitest";

import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import { getBuildCloudflareEnvironment } from "./wrangler.ts";

describe(getBuildCloudflareEnvironment, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("builds prod when no environment is named", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", undefined);

    expect(getBuildCloudflareEnvironment()).toBe(CloudflareEnvironment.Production);
  });

  test("builds the environment CI names", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", CloudflareEnvironment.Development);

    expect(getBuildCloudflareEnvironment()).toBe(CloudflareEnvironment.Development);
  });

  test("refuses an environment that does not exist", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", "staging");

    expect(() => getBuildCloudflareEnvironment()).toThrowErrorMatchingInlineSnapshot(
      `[Error: CLOUDFLARE_ENV must be one of dev, prod, got staging]`,
    );
  });
});
