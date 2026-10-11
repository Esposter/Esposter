import { H3Event } from "nitro/h3";
import { beforeEach, describe, expect, test, vi } from "vitest";

import csrf from "#src/runtime/server/middleware/csrf";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

vi.mock(import("#src/runtime/services/getSecurityRules"), () => ({
  getSecurityRules: vi.fn<typeof getSecurityRules>(),
}));

describe(csrf, () => {
  const COOKIE_NAME = "csrf-token";
  const HEADER_NAME = "x-csrf-token";
  const URL = "https://localhost/api";
  const TOKEN = "dG9rZW4tYS12YWx1ZQ==";

  const createEvent = (method: string, headers: Record<string, string> = {}): H3Event =>
    new H3Event(new Request(URL, { headers, method }));

  beforeEach(() => {
    vi.mocked(getSecurityRules).mockReturnValue({
      csrf: { cookieName: COOKIE_NAME, headerName: HEADER_NAME },
      enabled: true,
    });
  });

  test("a safe request is given a token cookie the page can read and the client repeats", () => {
    expect.hasAssertions();

    const event = createEvent("GET");

    csrf(event, () => undefined);

    expect(event.res.headers.get("set-cookie")).toMatch(/^csrf-token=[\w-]+; Path=\/; Secure; SameSite=Strict$/u);
  });

  test("a state-changing request without its header is refused with 403", () => {
    expect.hasAssertions();

    expect(() =>
      csrf(createEvent("POST", { cookie: `${COOKIE_NAME}=${TOKEN}` }), () => undefined),
    ).toThrowErrorMatchingInlineSnapshot(`[HTTPError: Forbidden]`);
  });

  test("a state-changing request whose header repeats its cookie passes", () => {
    expect.hasAssertions();

    expect(() =>
      csrf(createEvent("POST", { cookie: `${COOKIE_NAME}=${TOKEN}`, [HEADER_NAME]: TOKEN }), () => undefined),
    ).not.toThrow();
  });
});
