import { db } from "#server/db";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { verifyRealtimeKitWebhook } from "#server/services/realtimeKit/verifyRealtimeKitWebhook";
import { getResultAsync, jsonDateParse } from "@esposter/shared";
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
        jsonDateParse(new TextDecoder().decode(body)),
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
      const callObject = getCallObject(callSessionId);

      if (webhookEvent.event === "meeting.participantLeft") {
        const leave = await callObject.participantLeft({ callSessionId, sessionId });
        if (leave) await writeCallSummary(db, callSessionId, leave);
        return { ok: true };
      }

      const session = await db.query.sessionsInAuth.findFirst({
        where: { id: { eq: sessionId } },
        with: { usersInAuth: true },
      });
      if (!session) return { ok: true };
      else if (!(await checkIsCallConnectionAdmitted(db, callSessionId, session.userId))) {
        await callObject.removeConnection({ sessionId });
        return { ok: true };
      }

      await callObject.participantJoined({
        callSessionId,
        participant: createParticipant(session, session.usersInAuth),
      });
      return { ok: true };
    },
    (error) => {
      console.error(error);
      event.res.status = 500;
      return { message: "An internal server error occurred." };
    },
  );
});
