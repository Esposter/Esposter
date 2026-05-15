import { db } from "@@/server/db";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { createCallParticipant } from "@@/server/services/message/call/createCallParticipant";
import { leaveCallAsParticipant } from "@@/server/services/message/call/leaveCallAsParticipant";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { getResultAsync } from "@esposter/shared";
import { WebhookReceiver } from "livekit-server-sdk";

export default defineEventHandler(async (event) => {
  const { livekit } = useRuntimeConfig(event);
  const body = await readRawBody(event, "utf8");
  if (!body || !livekit?.apiKey || !livekit.apiSecret) {
    setResponseStatus(event, 400);
    return { message: "Invalid LiveKit webhook." };
  }

  const receiver = new WebhookReceiver(livekit.apiKey, livekit.apiSecret);
  return getResultAsync(() => receiver.receive(body, getHeader(event, "authorization"))).match(
    async (webhookEvent) => {
      const participant = webhookEvent.participant;
      const callSessionId = webhookEvent.room?.name ?? "";
      const sessionId = participant?.identity ?? "";
      if (!callSessionId || !sessionId) return { ok: true };

      if (webhookEvent.event === "participant_left") {
        const userId = callSessionParticipantMap.get(callSessionId)?.get(sessionId)?.userId ?? "";
        await leaveCallAsParticipant(db, callSessionId, sessionId, userId);
        return { ok: true };
      }

      if (webhookEvent.event !== "participant_joined") return { ok: true };

      const session = await db.query.sessions.findFirst({
        where: { id: { eq: sessionId } },
        with: { user: true },
      });
      if (!session) return { ok: true };

      const callParticipant = {
        id: session.id,
        image: session.user.image,
        isCameraEnabled: false,
        isMuted: false,
        name: session.user.name,
        userId: session.userId,
      };
      createCallParticipant(callSessionId, callParticipant);
      callEventEmitter.emit("joinCall", { callSessionId, participant: callParticipant, sessionId });
      return { ok: true };
    },
    () => {
      setResponseStatus(event, 400);
      return { message: "Invalid LiveKit webhook." };
    },
  );
});
