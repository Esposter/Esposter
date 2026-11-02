import { DEFAULT_BASIC_AUTH_REALM } from "#src/runtime/constants";
import basicAuth from "#src/runtime/server/middleware/basicAuth";
import { serializeBasicAuthChallenge } from "#src/runtime/services/serializeBasicAuthChallenge";
import { H3 } from "nitro/h3";
import { useRuntimeConfig } from "nuxt/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("nuxt/server"), () => ({ useRuntimeConfig: vi.fn<typeof useRuntimeConfig>() }));

describe(basicAuth, () => {
  const URL = "https://localhost/api";
  const OPTIONS = { name: "user", pass: "pass" };

  beforeEach(() => {
    vi.mocked(useRuntimeConfig).mockReturnValue({ private: { basicAuth: OPTIONS } } as never);
  });

  test("a request without its credentials is refused 401, and the response h3 sends carries the challenge", async () => {
    expect.hasAssertions();

    const response = await new H3().use(basicAuth).fetch(new Request(URL));

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBe(serializeBasicAuthChallenge(DEFAULT_BASIC_AUTH_REALM));
  });
});
