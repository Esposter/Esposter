import { callParticipantSchema } from "#src/models/message/call/CallParticipant";
import { callParticipantRowSchema } from "#src/models/message/call/CallParticipantRow";
import { RealtimeEventType } from "#src/models/realtime/RealtimeEventType";
import { callSessionIdSchema } from "#src/models/shared/CallSessionId";
import { CALL_AUTH_TOKEN_MAX_LENGTH } from "#src/services/message/constants";
import { z } from "zod";

// The events a call's socket carries, one frame each. No frame names an auth session: a connection is named by its
// Participant or knocker id alone. A participant's frame carries the row the call object holds, at the version it left it,
// So a member's view applies it through the same arrival gate as a read and a leave is a tombstone, not a removal
const callSessionId = callSessionIdSchema.shape.callSessionId;

const joinCallPayloadSchema = z.union([
  z.object({ callSessionId, participant: callParticipantRowSchema, type: z.literal("join") }),
  // A revoke that narrows a connection replaces it, and hands only the connection's own user the token to rejoin with
  z.object({
    authToken: z.string().min(1).max(CALL_AUTH_TOKEN_MAX_LENGTH),
    callSessionId,
    canPublishMicrophone: z.boolean(),
    type: z.literal("rejoin"),
  }),
]);
const joinCallEventSchema = z.object({ data: joinCallPayloadSchema, type: z.literal(RealtimeEventType.JoinCall) });
const leaveCallEventSchema = z.object({
  data: z.object({ callSessionId, participant: callParticipantRowSchema }),
  type: z.literal(RealtimeEventType.LeaveCall),
});
const videoChangedEventSchema = z.object({
  data: z.object({ callSessionId, participant: callParticipantRowSchema }),
  type: z.literal(RealtimeEventType.VideoChanged),
});
const handRaisedChangedEventSchema = z.object({
  data: z.object({ callSessionId, participant: callParticipantRowSchema }),
  type: z.literal(RealtimeEventType.HandRaisedChanged),
});
const muteChangedEventSchema = z.object({
  data: z.object({ callSessionId, participant: callParticipantRowSchema }),
  type: z.literal(RealtimeEventType.MuteChanged),
});
const knockCallEventSchema = z.object({
  data: z.object({ callSessionId, knocker: callParticipantSchema }),
  type: z.literal(RealtimeEventType.KnockCall),
});
const knockerAdmittedEventSchema = z.object({
  data: z.object({ callSessionId }),
  type: z.literal(RealtimeEventType.KnockerAdmitted),
});
const knockerDismissedEventSchema = z.object({
  data: z.object({ callSessionId }),
  type: z.literal(RealtimeEventType.KnockerDismissed),
});

const callEventSchemas = [
  joinCallEventSchema,
  leaveCallEventSchema,
  videoChangedEventSchema,
  handRaisedChangedEventSchema,
  muteChangedEventSchema,
  knockCallEventSchema,
  knockerAdmittedEventSchema,
  knockerDismissedEventSchema,
] as const;

export type CallEvent = z.infer<(typeof callEventSchemas)[number]>;

export const callEventSchema = z.discriminatedUnion("type", callEventSchemas) satisfies z.ZodType<CallEvent>;
