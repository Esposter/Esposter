import type { RuntimeConfig } from "nuxt/schema";

import { getLiveKitCredentials } from "#server/services/livekit/getLiveKitCredentials";
import { describe, expect, test, vi } from "vitest";

const { livekit } = vi.hoisted(() => ({ livekit: {} as { current: RuntimeConfig["livekit"] } }));

// oxlint-disable-next-line vitest/prefer-import-in-mock -- the stubbed `useRuntimeConfig` returns a fraction of the config, which the typed `import()` form holds to the real return type
vi.mock("nuxt/server", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useRuntimeConfig: () => ({ livekit: livekit.current }),
}));

describe(getLiveKitCredentials, () => {
  const credentials = { apiKey: "apiKey", apiSecret: "apiSecret", url: "url" };

  test("returns the credentials a fully configured deployment set", () => {
    expect.hasAssertions();

    livekit.current = credentials;

    expect(getLiveKitCredentials()).toStrictEqual(credentials);
  });

  // Nuxt coerces an unset runtimeConfig env var to "" rather than dropping the key, so a half-configured
  // Deployment reaches this as a present-but-empty value — and it has to read as unconfigured, or the token path
  // Mints a grant for a room the service client was never configured to create
  test.each(["apiKey", "apiSecret", "url"] as const)("returns undefined when only %s is unset", (key) => {
    expect.hasAssertions();

    livekit.current = { ...credentials, [key]: "" };

    expect(getLiveKitCredentials()).toBeUndefined();
  });
});
