import type { RuntimeConfig } from "nuxt/schema";

import { getLiveKitCredentials } from "@@/server/services/livekit/getLiveKitCredentials";
import { describe, expect, test, vi } from "vitest";

// The auto-imported `useRuntimeConfig` resolves to the nuxt app module rather than to a global, so the module is
// What a test has to answer — the global the resolved import never reads would leave the real one throwing
const { livekit } = vi.hoisted(() => ({ livekit: {} as { current: RuntimeConfig["livekit"] } }));

// oxlint-disable-next-line vitest/prefer-import-in-mock -- the server tsconfig maps no `#app/*`, so `import()` would not resolve
vi.mock("#app/nuxt", () => ({ useRuntimeConfig: () => ({ livekit: livekit.current }) as RuntimeConfig }));

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
