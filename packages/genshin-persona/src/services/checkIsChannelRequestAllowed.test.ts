import { checkIsChannelRequestAllowed } from "#src/services/checkIsChannelRequestAllowed";
import { describe, expect, test } from "vitest";

describe(checkIsChannelRequestAllowed, () => {
  const TOKEN = "3f9a1c";

  test("accepts the loopback with the token", () => {
    expect.hasAssertions();

    expect(checkIsChannelRequestAllowed("127.0.0.1", TOKEN, TOKEN)).toBe(true);
  });

  test("rejects a request from off the loopback even with the token", () => {
    expect.hasAssertions();

    expect(checkIsChannelRequestAllowed("192.168.1.20", TOKEN, TOKEN)).toBe(false);
  });

  test("rejects a wrong or missing token from the loopback", () => {
    expect.hasAssertions();

    expect(checkIsChannelRequestAllowed("127.0.0.1", "3f9a1d", TOKEN)).toBe(false);
    expect(checkIsChannelRequestAllowed("127.0.0.1", "", TOKEN)).toBe(false);
  });

  test("rejects a request with no remote address", () => {
    expect.hasAssertions();

    expect(checkIsChannelRequestAllowed(undefined, TOKEN, TOKEN)).toBe(false);
  });
});
