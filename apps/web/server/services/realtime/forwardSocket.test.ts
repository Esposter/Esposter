import type { DurableObjectStub } from "@cloudflare/workers-types";
import type { SocketIdentity } from "@esposter/db-schema";
import type { RequestEvent } from "nuxt/server";

import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { SOCKET_IDENTITY_HEADER } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

interface ForwardedInit {
  headers: Record<string, string>;
}

describe(forwardSocket, () => {
  const identity: SocketIdentity = {
    deviceId: "33333333-3333-7333-8333-333333333333",
    sessionId: "session-abcdefghijklmnop",
    userId: "22222222-2222-7222-8222-222222222222",
  };
  const url = "https://esposter.com/ws/user";
  const createEvent = (headers: Record<string, string>) =>
    ({
      req: new Request(url, { headers: { ...headers, Upgrade: "websocket" } }),
      res: { headers: new Headers({ "X-Frame-Options": "DENY" }) },
    }) as unknown as RequestEvent;
  const createStub = () => {
    const fetch = vi.fn<(url: string, init: ForwardedInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null)),
    );
    return { fetch, stub: { fetch } as unknown as DurableObjectStub };
  };

  test("replaces an identity header the client sent with the identity the Worker verified", async () => {
    expect.hasAssertions();

    const { fetch, stub } = createStub();
    await forwardSocket(
      createEvent({ [SOCKET_IDENTITY_HEADER.userId]: "44444444-4444-7444-8444-444444444444" }),
      stub,
      identity,
    );

    const headers = fetch.mock.calls[0]?.[1].headers;
    expect(headers?.[SOCKET_IDENTITY_HEADER.userId]).toBe(identity.userId);
    expect(headers?.[SOCKET_IDENTITY_HEADER.sessionId]).toBe(identity.sessionId);
    expect(headers?.[SOCKET_IDENTITY_HEADER.deviceId]).toBe(identity.deviceId);
  });

  test("keeps the upgrade headers the socket needs", async () => {
    expect.hasAssertions();

    const { fetch, stub } = createStub();
    await forwardSocket(createEvent({}), stub, identity);

    expect(fetch.mock.calls[0]?.[1].headers.upgrade).toBe("websocket");
  });

  test("clears the prepared response headers, so h3 returns the object's upgrade with its socket instead of rebuilding it", async () => {
    expect.hasAssertions();

    const event = createEvent({});
    await forwardSocket(event, createStub().stub, identity);

    expect([...event.res.headers]).toStrictEqual([]);
  });
});
