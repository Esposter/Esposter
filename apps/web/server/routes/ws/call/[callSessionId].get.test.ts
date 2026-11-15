import type { db } from "#server/db/index";
import type { RequestEvent } from "nuxt/server";

import { callObjectCalls } from "#server/composables/realtime/useCallObject.test";
import callSocket from "#server/routes/ws/call/[callSessionId].get";
import { readSession } from "#server/services/auth/readSession";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#server/db/index"), () => ({ db: {} }) as unknown as Partial<{ db: typeof db }>);
vi.mock(import("#server/services/auth/readSession"), () => ({ readSession: vi.fn<typeof readSession>() }));
vi.mock(import("#server/services/message/call/checkIsCallConnectionAdmitted"), () => ({
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

    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(true);
    callObjectCalls.length = 0;
    await callSocket(createEvent());

    expect(callObjectCalls.map(({ callSessionId, method }) => ({ callSessionId, method }))).toStrictEqual([
      { callSessionId: "abcdefghijkl", method: "fetch" },
    ]);
  });
});

const createSessionPayload = () =>
  ({
    session: { expiresAt: new Date(0), id: "session-abcdefghijklmnop" },
    user: { id: "22222222-2222-7222-8222-222222222222" },
  }) as Awaited<ReturnType<typeof readSession>>;

const createEvent = () => {
  const url = "https://esposter.com/ws/call/abcdefghijkl?deviceId=33333333-3333-7333-8333-333333333333";
  return {
    context: { params: { callSessionId: "abcdefghijkl" } },
    req: new Request(url, { headers: { Upgrade: "websocket" } }),
    res: { headers: new Headers() },
    url: new URL(url),
  } as unknown as RequestEvent;
};
