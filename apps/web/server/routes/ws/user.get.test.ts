import type { RequestEvent } from "nuxt/server";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import userSocket from "#server/routes/ws/user.get";
import { readSession } from "#server/services/auth/readSession";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#server/services/auth/readSession"), () => ({ readSession: vi.fn<typeof readSession>() }));

describe("ws/user", () => {
  test("refuses a socket with no session", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(null);
    await expect(userSocket(createEvent())).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError: HTTPError 401]`);
  });

  test("forwards the upgrade to the person's own object", async () => {
    expect.hasAssertions();

    vi.mocked(readSession).mockResolvedValueOnce(createSessionPayload());
    userObjectCalls.length = 0;
    await userSocket(createEvent());

    expect(userObjectCalls.map(({ method, userId }) => ({ method, userId }))).toStrictEqual([
      { method: "fetch", userId: "22222222-2222-7222-8222-222222222222" },
    ]);
  });
});

const createSessionPayload = () =>
  ({ session: { id: "session-abcdefghijklmnop" }, user: { id: "22222222-2222-7222-8222-222222222222" } }) as Awaited<
    ReturnType<typeof readSession>
  >;

const createEvent = () => {
  const url = "https://esposter.com/ws/user?deviceId=33333333-3333-7333-8333-333333333333";
  return { req: new Request(url, { headers: { Upgrade: "websocket" } }), url: new URL(url) } as unknown as RequestEvent;
};
