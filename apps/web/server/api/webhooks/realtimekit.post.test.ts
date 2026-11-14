import type { db } from "#server/db";
import type { getCallObject } from "#server/services/message/call/getCallObject";
import type { RequestEvent } from "nuxt/server";

import callWebhook from "#server/api/webhooks/realtimekit.post";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createRealtimeKitWebhookSigner } from "#server/services/realtimeKit/createRealtimeKitWebhookSigner.test";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

const { callObject, findCallSession, findSession } = vi.hoisted(() => ({
  callObject: {
    participantJoined: vi.fn<(input: unknown) => Promise<void>>(),
    removeConnection: vi.fn<(input: unknown) => Promise<void>>(),
  },
  findCallSession: vi.fn<(query: unknown) => Promise<unknown>>(),
  findSession: vi.fn<(query: unknown) => Promise<unknown>>(),
}));

vi.mock(
  import("#server/db"),
  () =>
    ({
      db: {
        query: { callSessionsInMessage: { findFirst: findCallSession }, sessionsInAuth: { findFirst: findSession } },
      },
    }) as unknown as Partial<{ db: typeof db }>,
);
vi.mock(import("#server/services/message/call/checkIsCallConnectionAdmitted"), () => ({
  checkIsCallConnectionAdmitted: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
}));
vi.mock(import("#server/services/message/call/getCallObject"), () => ({
  getCallObject: () => callObject as unknown as ReturnType<typeof getCallObject>,
}));

const createEvent = (body: ArrayBuffer, signature: string) =>
  ({
    req: new Request("https://esposter.com/api/webhooks/realtimekit", {
      body,
      headers: { "rtk-signature": signature },
      method: "POST",
    }),
    res: { status: 200 },
  }) as unknown as RequestEvent;

describe("api/webhooks/realtimekit", () => {
  const callSessionId = v7();
  const meetingId = v7();
  const sessionId = v7();
  const userId = v7();
  let signer: Awaited<ReturnType<typeof createRealtimeKitWebhookSigner>>;

  beforeAll(async () => {
    signer = await createRealtimeKitWebhookSigner();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("removes a correctly signed participant the call does not admit, and never joins it", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ data: { publicKey: signer.publicKeyPem } }))),
    );
    findCallSession.mockResolvedValueOnce({ id: callSessionId });
    findSession.mockResolvedValueOnce({
      id: sessionId,
      userId,
      usersInAuth: { id: userId, image: null, name: "name" },
    });
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(false);
    const body = new TextEncoder().encode(
      JSON.stringify({
        event: "meeting.participantJoined",
        meeting: { id: meetingId },
        participant: { customParticipantId: sessionId },
      }),
    ).buffer;

    await callWebhook(createEvent(body, await signer.sign(body)));

    expect(callObject.removeConnection).toHaveBeenCalledExactlyOnceWith({ sessionId });
    expect(callObject.participantJoined).not.toHaveBeenCalled();
  });
});
