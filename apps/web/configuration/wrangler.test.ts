import { getCloudflareEnvironment } from "#configuration/wrangler";
import { afterEach, describe, expect, test, vi } from "vitest";

import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";

describe(getCloudflareEnvironment, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("builds prod when no environment is named", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", undefined);
    vi.stubEnv("NODE_ENV", "production");

    expect(getCloudflareEnvironment()).toBe(CloudflareEnvironment.Production);
  });

  test("binds the development environment under the dev server when no environment is named", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", undefined);
    vi.stubEnv("NODE_ENV", "development");

    expect(getCloudflareEnvironment()).toBe(CloudflareEnvironment.Development);
  });

  test("builds the environment CI names", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", CloudflareEnvironment.Development);

    expect(getCloudflareEnvironment()).toBe(CloudflareEnvironment.Development);
  });

  test("refuses an environment that does not exist", () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", "staging");

    expect(() => getCloudflareEnvironment()).toThrowErrorMatchingInlineSnapshot(
      `[Error: CLOUDFLARE_ENV must be one of dev, prod, got staging]`,
    );
  });
});
