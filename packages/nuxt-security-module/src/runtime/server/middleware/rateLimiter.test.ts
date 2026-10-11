import { H3Event } from "nitro/h3";
import { beforeEach, describe, expect, test, vi } from "vitest";

import rateLimiter from "#src/runtime/server/middleware/rateLimiter";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

vi.mock(import("#src/runtime/services/getSecurityRules"), () => ({
  getSecurityRules: vi.fn<typeof getSecurityRules>(),
}));

describe(rateLimiter, () => {
  const INTERVAL_IN_MILLISECONDS = 60_000;
  const TOKENS_PER_INTERVAL = 1;
  const URL = "http://localhost/api";
  const SOCKET_ADDRESS = "203.0.113.5";

  // The socket address is the connection's, which a client cannot write, unlike its own forwarded header
  const createEvent = (forwardedFor: string): H3Event =>
    new H3Event(
      Object.assign(new Request(URL, { headers: { "x-forwarded-for": forwardedFor } }), { ip: SOCKET_ADDRESS }),
    );

  beforeEach(() => {
    vi.mocked(getSecurityRules).mockReturnValue({
      enabled: true,
      rateLimiter: { intervalInMilliseconds: INTERVAL_IN_MILLISECONDS, tokensPerInterval: TOKENS_PER_INTERVAL },
    });
  });

  test("#83 #196 a forwarded address the client writes does not change its key, so it cannot spend a fresh count", async () => {
    expect.hasAssertions();

    const first = createEvent("198.51.100.1");
    const second = createEvent("198.51.100.2");

    await rateLimiter(first, () => undefined);

    await expect(rateLimiter(second, () => undefined)).rejects.toMatchObject({ status: 429 });
  });
});
