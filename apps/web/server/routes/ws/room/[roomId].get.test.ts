import type { H3Event } from "nuxt/server";

import { TRPCError } from "@trpc/server";
import { env } from "@esposter/db-mock";
import { describe, expect, test, vi } from "vitest";

import roomSocket from "#server/routes/ws/room/[roomId].get";
import { readSession } from "#server/services/auth/readSession";
import { assertIsMember } from "#server/services/room/assertIsMember";

vi.mock("#server/db", () => ({ db: {} }));
vi.mock("#server/services/auth/readSession", () => ({ readSession: vi.fn<(headers: Headers) => Promise<unknown>>() }));
vi.mock("#server/services/room/assertIsMember", () => ({
  assertIsMember: vi.fn<(...args: unknown[]) => Promise<void>>(),
}));

describe("ws/room/[roomId]", () => {
  test("refuses a socket with no session", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(null);
    await expect(roomSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: HTTPError 401]`);
  });

  test("refuses a socket to a room the person is not a member of", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(assertIsMember).mockRejectedValueOnce(new TRPCError({ code: "UNAUTHORIZED" }));
    await expect(roomSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: Forbidden]`);
  });

  test("forwards a member's socket to the room's object", async () => {
    expect.hasAssertions();

    const namespace = createNamespace();
    env.ROOM = namespace;
    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(assertIsMember).mockResolvedValueOnce(undefined);
    await roomSocket(createEvent());

    expect(namespace.idFromName).toHaveBeenCalledExactlyOnceWith("11111111-1111-7111-8111-111111111111");
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
  const url =
    "https://esposter.com/ws/room/11111111-1111-7111-8111-111111111111?deviceId=33333333-3333-7333-8333-333333333333";
  return {
    context: { params: { roomId: "11111111-1111-7111-8111-111111111111" } },
    req: new Request(url, { headers: { Upgrade: "websocket" } }),
    url: new URL(url),
  } as unknown as H3Event;
};
