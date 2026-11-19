import { useCallObject } from "#server/composables/realtime/useCallObject";
import { db } from "#server/db/index";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { consumeRequestAddressRateLimit } from "#server/services/rateLimiter/consumeRequestAddressRateLimit";
import { verifyRealtimeKitWebhook } from "#server/services/realtimeKit/verifyRealtimeKitWebhook";
import { getResultAsync, jsonDateParse, RealtimeKitWebhookEvent } from "@esposter/shared";
import { defineEventHandler } from "nuxt/server";
import { z } from "zod";

// The two events this route is subscribed to; RealtimeKit delivers no other to it
const realtimeKitWebhookSchema = z.object({
  event: z.enum(RealtimeKitWebhookEvent),
  meeting: z.object({ id: z.string() }),
  participant: z.object({ customParticipantId: z.string(), leftAt: z.coerce.date().optional() }),
});

export default defineEventHandler(async (event) => {
  const body = await event.req.arrayBuffer();
  const getInvalidWebhookResponse = (status: number) => {
    event.res.status = status;
    return { message: "Invalid RealtimeKit webhook." };
  };

  // The route answers before it knows its caller, so the address is spent first, as every such route spends it
  if (!(await consumeRequestAddressRateLimit(event))) return getInvalidWebhookResponse(429);
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
      // RealtimeKit reports the participant id a connection was added with, which the call holds it by
      const participantId = webhookEvent.participant.customParticipantId;
      if (!callSession) return { ok: true };
      const callSessionId = callSession.id;
      const callObject = useCallObject(callSessionId);

      if (webhookEvent.event === "meeting.participantLeft") {
        const leave = await callObject.participantLeft({
          callSessionId,
          leftAt: webhookEvent.participant.leftAt ?? new Date(),
          participantId,
        });
        if (leave) await writeCallSummary(db, callSessionId, leave);
        return { ok: true };
      }

      // A connection the call holds for a user who is still admitted stays. One it does not hold, or whose user is no
      // Longer admitted, is dropped at RealtimeKit
      const userId = await callObject.readParticipantUserId({ participantId });
      if (!userId || !(await checkIsCallConnectionAdmitted(db, callSessionId, userId)))
        await callObject.removeConnection({ participantId });
      return { ok: true };
    },
    (error) => {
      console.error(error);
      event.res.status = 500;
      return { message: "An internal server error occurred." };
    },
  );
});
