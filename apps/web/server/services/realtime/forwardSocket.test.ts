import type { DurableObjectStub } from "@cloudflare/workers-types";
import type { SocketIdentity } from "@esposter/db-schema";

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

  test("replaces an identity header the client sent with the identity the Worker verified", async () => {
    expect.hasAssertions();

    const fetch = vi.fn<(url: string, init: ForwardedInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null)),
    );
    const request = new Request("https://esposter.com/ws/user", {
      headers: { [SOCKET_IDENTITY_HEADER.userId]: "44444444-4444-7444-8444-444444444444", Upgrade: "websocket" },
    });
    await forwardSocket({ fetch } as unknown as DurableObjectStub, request, identity);

    const headers = fetch.mock.calls[0]?.[1].headers;
    expect(headers?.[SOCKET_IDENTITY_HEADER.userId]).toBe(identity.userId);
    expect(headers?.[SOCKET_IDENTITY_HEADER.sessionId]).toBe(identity.sessionId);
    expect(headers?.[SOCKET_IDENTITY_HEADER.deviceId]).toBe(identity.deviceId);
  });

  test("keeps the upgrade headers the socket needs", async () => {
    expect.hasAssertions();

    const fetch = vi.fn<(url: string, init: ForwardedInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null)),
    );
    await forwardSocket(
      { fetch } as unknown as DurableObjectStub,
      new Request("https://esposter.com/ws/user", { headers: { Upgrade: "websocket" } }),
      identity,
    );

    expect(fetch.mock.calls[0]?.[1].headers.upgrade).toBe("websocket");
  });
});
