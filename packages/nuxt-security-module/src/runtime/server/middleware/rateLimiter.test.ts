import rateLimiter from "#src/runtime/server/middleware/rateLimiter";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { H3 } from "nitro/h3";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/runtime/services/getSecurityRules"), () => ({
  getSecurityRules: vi.fn<typeof getSecurityRules>(),
}));

describe(rateLimiter, () => {
  const INTERVAL_IN_MILLISECONDS = 60_000;
  const TOKENS_PER_INTERVAL = 1;
  const URL = "http://localhost/api";
  const SOCKET_ADDRESS = "203.0.113.5";

  // The socket address is the connection's, which a client cannot write, unlike its own forwarded header
  const createRequest = (forwardedFor: string): Request =>
    Object.assign(new Request(URL, { headers: { "x-forwarded-for": forwardedFor } }), { ip: SOCKET_ADDRESS });

  beforeEach(() => {
    vi.mocked(getSecurityRules).mockReturnValue({
      enabled: true,
      rateLimiter: { intervalInMilliseconds: INTERVAL_IN_MILLISECONDS, tokensPerInterval: TOKENS_PER_INTERVAL },
    });
  });

  test("#83 #196 a forwarded address the client writes does not change its key, so it cannot spend a fresh count", async () => {
    expect.hasAssertions();

    const app = new H3().use(rateLimiter);

    await app.fetch(createRequest("198.51.100.1"));

    const response = await app.fetch(createRequest("198.51.100.2"));

    expect(response.status).toBe(429);
    // The window is one minute and the refused request is the one within it, so it is told to wait the whole of it
    expect(response.headers.get("Retry-After")).toBe(String(INTERVAL_IN_MILLISECONDS / 1000));
  });
});
