import corsHandler from "#src/runtime/server/middleware/corsHandler";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { H3Event } from "nitro/h3";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/runtime/services/getSecurityRules"), () => ({
  getSecurityRules: vi.fn<typeof getSecurityRules>(),
}));

describe(corsHandler, () => {
  const ORIGIN = "https://localhost";
  const URL = "https://localhost/api";

  // A preflight is an options request that names the origin it comes from and the method it will send
  const createEvent = (method: string): H3Event =>
    new H3Event(new Request(URL, { headers: { "access-control-request-method": "GET", origin: ORIGIN }, method }));

  beforeEach(() => {
    vi.mocked(getSecurityRules).mockReturnValue({
      corsHandler: { methods: ["GET"], origin: ORIGIN, preflight: { statusCode: 204 } },
      enabled: true,
    });
  });

  test("a preflight is answered 204 by the middleware, whose response ends the request before a handler", () => {
    expect.hasAssertions();

    const response = corsHandler(createEvent("OPTIONS"), () => undefined);

    expect(response).toMatchObject({ status: 204 });
  });

  test("a request that is not a preflight passes on to its handler", () => {
    expect.hasAssertions();

    expect(corsHandler(createEvent("GET"), () => undefined)).toBeUndefined();
  });
});
