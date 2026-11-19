import type { useCallObject } from "#server/composables/realtime/useCallObject";
import type { db } from "#server/db/index";
import type { RequestEvent } from "nuxt/server";

import callWebhook from "#server/api/webhooks/realtimekit.post";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createRealtimeKitWebhookSigner } from "#server/services/realtimeKit/createRealtimeKitWebhookSigner.test";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

const { callObject, findCallSession } = vi.hoisted(() => ({
  callObject: {
    readParticipantUserId: vi.fn<(input: unknown) => string>(),
    removeConnection: vi.fn<(input: unknown) => Promise<void>>(),
  },
  findCallSession: vi.fn<(query: unknown) => Promise<unknown>>(),
}));

vi.mock(
  import("#server/db/index"),
  () =>
    ({ db: { query: { callSessionsInMessage: { findFirst: findCallSession } } } }) as unknown as Partial<{
      db: typeof db;
    }>,
);
vi.mock(import("#server/services/message/call/checkIsCallConnectionAdmitted"), () => ({
  checkIsCallConnectionAdmitted: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
}));
vi.mock(import("#server/composables/realtime/useCallObject"), () => ({
  useCallObject: () => callObject as unknown as ReturnType<typeof useCallObject>,
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
  const participantId = v7();
  const userId = v7();
  let signer: Awaited<ReturnType<typeof createRealtimeKitWebhookSigner>>;

  beforeAll(async () => {
    signer = await createRealtimeKitWebhookSigner();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  // A signed join of a connection, under the participant id RealtimeKit was given it with
  const sendJoin = async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ data: { publicKey: signer.publicKeyPem } }))),
    );
    findCallSession.mockResolvedValueOnce({ id: callSessionId });
    const body = new TextEncoder().encode(
      JSON.stringify({
        event: "meeting.participantJoined",
        meeting: { id: meetingId },
        participant: { customParticipantId: participantId },
      }),
    ).buffer;

    await callWebhook(createEvent(body, await signer.sign(body)));
  };

  test("removes a participant whose user the call does not admit", async () => {
    expect.hasAssertions();

    callObject.readParticipantUserId.mockReturnValueOnce(userId);
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(false);

    await sendJoin();

    expect(callObject.removeConnection).toHaveBeenCalledExactlyOnceWith({ participantId });
  });

  test("keeps a participant the call holds for a user it still admits", async () => {
    expect.hasAssertions();

    callObject.readParticipantUserId.mockReturnValueOnce(userId);
    vi.mocked(checkIsCallConnectionAdmitted).mockResolvedValueOnce(true);

    await sendJoin();

    expect(callObject.removeConnection).not.toHaveBeenCalled();
  });

  test("removes a connection the call holds no participant for", async () => {
    expect.hasAssertions();

    callObject.readParticipantUserId.mockReturnValueOnce("");

    await sendJoin();

    expect(callObject.removeConnection).toHaveBeenCalledExactlyOnceWith({ participantId });
    expect(checkIsCallConnectionAdmitted).not.toHaveBeenCalled();
  });

  test("answers 401 to a signature that is not base64, rather than failing the request", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ data: { publicKey: signer.publicKeyPem } }))),
    );
    const event = createEvent(new ArrayBuffer(0), "not base64!");

    const response = await callWebhook(event);

    expect(event.res.status).toBe(401);
    expect(response).toStrictEqual({ message: "Invalid RealtimeKit webhook." });
  });
});
