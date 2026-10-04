import { db } from "#server/db";
import { removeLiveKitParticipant } from "#server/services/livekit/removeLiveKitParticipant";
import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createCallParticipant } from "#server/services/message/call/createCallParticipant";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { leaveCallAsParticipant } from "#server/services/message/call/leaveCallAsParticipant";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { getResultAsync } from "@esposter/shared";
import { WebhookReceiver } from "livekit-server-sdk";
import { defineEventHandler, useRuntimeConfig } from "nuxt/server";

export default defineEventHandler(async (event) => {
  const { livekit } = useRuntimeConfig();
  const body = await event.req.text();
  const getInvalidWebhookResponse = () => {
    event.res.status = 400;
    return { message: "Invalid LiveKit webhook." };
  };
  if (!body || !livekit?.apiKey || !livekit.apiSecret) return getInvalidWebhookResponse();

  const webhookReceiver = new WebhookReceiver(livekit.apiKey, livekit.apiSecret);
  return getResultAsync(() => webhookReceiver.receive(body, event.req.headers.get("authorization") ?? undefined)).match(
    async (webhookEvent) => {
      const callSessionId = webhookEvent.room?.name ?? "";
      const sessionId = webhookEvent.participant?.identity ?? "";
      if (!callSessionId || !sessionId) return { ok: true };

      if (["participant_connection_aborted", "participant_left"].includes(webhookEvent.event)) {
        const userId = callSessionParticipantMap.get(callSessionId)?.get(sessionId)?.userId ?? "";
        await leaveCallAsParticipant(db, callSessionId, sessionId, userId);
        return { ok: true };
      }

      if (webhookEvent.event !== "participant_joined") return { ok: true };

      const session = await db.query.sessionsInAuth.findFirst({
        where: { id: { eq: sessionId } },
        with: { usersInAuth: true },
      });
      if (!session) return { ok: true };
      else if (!(await checkIsCallConnectionAdmitted(db, callSessionId, session.userId))) {
        await removeLiveKitParticipant(callSessionId, sessionId);
        return { ok: true };
      }

      const callParticipant = createParticipant(session, session.usersInAuth);
      createCallParticipant(callSessionId, callParticipant);
      callEventEmitter.emit("joinCall", { callSessionId, participant: callParticipant, sessionId });
      return { ok: true };
    },
    () => getInvalidWebhookResponse(),
  );
});
