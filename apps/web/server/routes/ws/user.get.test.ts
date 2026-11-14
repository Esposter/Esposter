import type { H3Event } from "nuxt/server";

import { env } from "@esposter/db-mock";
import { describe, expect, test, vi } from "vitest";

import userSocket from "#server/routes/ws/user.get";
import { readSession } from "#server/services/auth/readSession";

vi.mock("#server/services/auth/readSession", () => ({ readSession: vi.fn<(headers: Headers) => Promise<unknown>>() }));

describe("ws/user", () => {
  test("refuses a socket with no session", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(null);
    await expect(userSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: HTTPError 401]`);
  });

  test("forwards the upgrade to the person's own object", async () => {
    expect.hasAssertions();

    const namespace = createNamespace();
    env.USER = namespace;
    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    await userSocket(createEvent());

    expect(namespace.idFromName).toHaveBeenCalledExactlyOnceWith("22222222-2222-7222-8222-222222222222");
  });
});

const createNamespace = () => ({
  get: vi.fn<(id: string) => { fetch: (request: Request) => Promise<Response> }>(() => ({
    fetch: () => Promise.resolve(new Response(null)),
  })),
  idFromName: vi.fn<(name: string) => string>((name) => name),
});

const createSessionPayload = () =>
  ({ session: { id: "session-abcdefghijklmnop" }, user: { id: "22222222-2222-7222-8222-222222222222" } }) as Awaited<
    ReturnType<typeof readSession>
  >;

const createEvent = () => {
  const url = "https://esposter.com/ws/user?deviceId=33333333-3333-7333-8333-333333333333";
  return { req: new Request(url, { headers: { Upgrade: "websocket" } }), url: new URL(url) } as unknown as H3Event;
};
