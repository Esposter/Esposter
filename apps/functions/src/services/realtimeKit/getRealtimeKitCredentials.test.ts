import { getRealtimeKitCredentials } from "#src/services/realtimeKit/getRealtimeKitCredentials";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getRealtimeKitCredentials, () => {
  const credentials = { apiToken: "apiToken", appId: "appId" };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("reads the credentials from the environment", () => {
    expect.hasAssertions();

    vi.stubEnv("REALTIMEKIT_API_TOKEN", credentials.apiToken);
    vi.stubEnv("REALTIMEKIT_APP_ID", credentials.appId);

    expect(getRealtimeKitCredentials()).toStrictEqual(credentials);
  });

  test.each(["REALTIMEKIT_API_TOKEN", "REALTIMEKIT_APP_ID"])("is absent when %s is unset", (environmentName) => {
    expect.hasAssertions();

    vi.stubEnv("REALTIMEKIT_API_TOKEN", credentials.apiToken);
    vi.stubEnv("REALTIMEKIT_APP_ID", credentials.appId);
    vi.stubEnv(environmentName, undefined);

    expect(getRealtimeKitCredentials()).toBeUndefined();
  });
});
