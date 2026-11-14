import type { RequestEvent } from "nuxt/server";

import { env } from "@esposter/db-mock";
import { describe, expect, test, vi } from "vitest";

import callSocket from "#server/routes/ws/call/[callSessionId].get";
import { readSession } from "#server/services/auth/readSession";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";

vi.mock("#server/db", () => ({ db: {} }));
vi.mock("#server/services/auth/readSession", () => ({ readSession: vi.fn<(headers: Headers) => Promise<unknown>>() }));
vi.mock("#server/services/message/call/checkIsCallConnectionAdmitted", () => ({
  checkIsCallConnectionAdmitted: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
}));

describe("ws/call/[callSessionId]", () => {
  test("refuses a socket with no session", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(null);
    await expect(callSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: HTTPError 401]`);
  });

  test("refuses a connection the call does not admit", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(false);
    await expect(callSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: HTTPError 403]`);
  });

  test("forwards an admitted connection to the call's object", async () => {
    expect.hasAssertions();

    const namespace = createNamespace();
    env.CALL = namespace;
    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(true);
    await callSocket(createEvent());

    expect(namespace.idFromName).toHaveBeenCalledExactlyOnceWith("abcdefghijkl");
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
  const url = "https://esposter.com/ws/call/abcdefghijkl?deviceId=33333333-3333-7333-8333-333333333333";
  return {
    context: { params: { callSessionId: "abcdefghijkl" } },
    req: new Request(url, { headers: { Upgrade: "websocket" } }),
    url: new URL(url),
  } as unknown as RequestEvent;
};
