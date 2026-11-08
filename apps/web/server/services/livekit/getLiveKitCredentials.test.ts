import { getLiveKitCredentials } from "#server/services/livekit/getLiveKitCredentials";
import { describe, expect, test, vi } from "vitest";

describe(getLiveKitCredentials, () => {
  const credentials = { apiKey: "apiKey", apiSecret: "apiSecret", url: "url" };

  test("returns the credentials a fully configured deployment set", () => {
    expect.hasAssertions();

    vi.stubEnv("LIVEKIT_URL", credentials.url);
    vi.stubEnv("LIVEKIT_API_KEY", credentials.apiKey);
    vi.stubEnv("LIVEKIT_API_SECRET", credentials.apiSecret);

    expect(getLiveKitCredentials()).toStrictEqual(credentials);
  });

  // A half-configured deployment can leave a variable present but empty rather than unset, and that has to read as
  // Unconfigured, or the token path mints a grant for a room the service client was never configured to create
  test.each([
    { environmentName: "LIVEKIT_API_KEY", key: "apiKey" },
    { environmentName: "LIVEKIT_API_SECRET", key: "apiSecret" },
    { environmentName: "LIVEKIT_URL", key: "url" },
  ])("returns undefined when only $key is unset", ({ environmentName }) => {
    expect.hasAssertions();

    vi.stubEnv("LIVEKIT_URL", credentials.url);
    vi.stubEnv("LIVEKIT_API_KEY", credentials.apiKey);
    vi.stubEnv("LIVEKIT_API_SECRET", credentials.apiSecret);
    vi.stubEnv(environmentName, "");

    expect(getLiveKitCredentials()).toBeUndefined();
  });
});
