import type { db } from "#server/db/index";
import type { RequestEvent } from "nuxt/server";

import { roomObjectCalls } from "#server/composables/realtime/useRoomObject.test";
import roomSocket from "#server/routes/ws/room/[roomId].get";
import { readSession } from "#server/services/auth/readSession";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { TRPCError } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#server/db/index"), () => ({ db: {} as unknown as typeof db }));
vi.mock(import("#server/services/auth/readSession"), () => ({ readSession: vi.fn<typeof readSession>() }));
vi.mock(import("#server/services/room/assertIsMember"), () => ({ assertIsMember: vi.fn<typeof assertIsMember>() }));

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

    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(assertIsMember).mockResolvedValueOnce(undefined);
    roomObjectCalls.length = 0;
    await roomSocket(createEvent());

    expect(roomObjectCalls.map(({ method, roomId }) => ({ method, roomId }))).toStrictEqual([
      { method: "fetch", roomId: "11111111-1111-7111-8111-111111111111" },
    ]);
  });
});

const createSessionPayload = () =>
  ({
    session: { expiresAt: new Date(0), id: "session-abcdefghijklmnop" },
    user: { id: "22222222-2222-7222-8222-222222222222" },
  }) as Awaited<ReturnType<typeof readSession>>;

const createEvent = () => {
  const url =
    "https://esposter.com/ws/room/11111111-1111-7111-8111-111111111111?deviceId=33333333-3333-7333-8333-333333333333";
  return {
    context: { params: { roomId: "11111111-1111-7111-8111-111111111111" } },
    req: new Request(url, { headers: { Upgrade: "websocket" } }),
    res: { headers: new Headers() },
    url: new URL(url),
  } as unknown as RequestEvent;
};
