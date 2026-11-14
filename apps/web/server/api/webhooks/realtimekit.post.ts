import { db } from "#server/db";
import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createCallParticipant } from "#server/services/message/call/createCallParticipant";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { leaveCallAsParticipant } from "#server/services/message/call/leaveCallAsParticipant";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { removeRealtimeKitParticipant } from "#server/services/realtimeKit/removeRealtimeKitParticipant";
import { verifyRealtimeKitWebhook } from "#server/services/realtimeKit/verifyRealtimeKitWebhook";
import { getResultAsync } from "@esposter/shared";
import { defineEventHandler } from "nuxt/server";
import { z } from "zod";

// The two events this route is subscribed to; RealtimeKit delivers no other to it
const realtimeKitWebhookSchema = z.object({
  event: z.enum(["meeting.participantJoined", "meeting.participantLeft"]),
  meeting: z.object({ id: z.string() }),
  participant: z.object({ customParticipantId: z.string() }),
});

export default defineEventHandler(async (event) => {
  const body = await event.req.arrayBuffer();
  const getInvalidWebhookResponse = (status: number) => {
    event.res.status = status;
    return { message: "Invalid RealtimeKit webhook." };
  };

  // Verified over the bytes as they arrived: a body re-serialised after parsing would not match what was signed
  return getResultAsync(() => verifyRealtimeKitWebhook(body, event.req.headers.get("rtk-signature") ?? "")).match(
    async (isVerified) => {
      if (!isVerified) return getInvalidWebhookResponse(401);
      const { data: webhookEvent, success } = realtimeKitWebhookSchema.safeParse(
        JSON.parse(new TextDecoder().decode(body)),
      );
      if (!success) return getInvalidWebhookResponse(400);

      // A meeting belongs to one call session, so its id names the call the connection is in
      const callSession = await db.query.callSessionsInMessage.findFirst({
        columns: { id: true },
        where: { meetingId: { eq: webhookEvent.meeting.id } },
      });
      const sessionId = webhookEvent.participant.customParticipantId;
      if (!callSession) return { ok: true };
      const callSessionId = callSession.id;

      if (webhookEvent.event === "meeting.participantLeft") {
        const userId = callSessionParticipantMap.get(callSessionId)?.get(sessionId)?.userId ?? "";
        await leaveCallAsParticipant(db, callSessionId, sessionId, userId);
        return { ok: true };
      }

      const session = await db.query.sessionsInAuth.findFirst({
        where: { id: { eq: sessionId } },
        with: { usersInAuth: true },
      });
      if (!session) return { ok: true };
      else if (!(await checkIsCallConnectionAdmitted(db, callSessionId, session.userId))) {
        await removeRealtimeKitParticipant(webhookEvent.meeting.id, sessionId);
        return { ok: true };
      }

      const callParticipant = createParticipant(session, session.usersInAuth);
      createCallParticipant(callSessionId, callParticipant);
      callEventEmitter.emit("joinCall", { callSessionId, participant: callParticipant, sessionId });
      return { ok: true };
    },
    (error) => {
      console.error(error);
      event.res.status = 500;
      return { message: "An internal server error occurred." };
    },
  );
});
