import { callSessionIdSchema } from "#src/models/shared/CallSessionId";
import { sessionIdSchema } from "#src/models/shared/SessionId";
import { z } from "zod";
import { callParticipantSchema } from "#src/models/message/call/CallParticipant";
import { CALL_AUTH_TOKEN_MAX_LENGTH } from "#src/services/message/constants";

// The events a call's socket carries, one frame each. The participant's id is the session it joined under
const callSessionId = callSessionIdSchema.shape.callSessionId;
const participantId = callParticipantSchema.shape.id;

const joinCallPayloadSchema = z.union([
  z.object({
    callSessionId,
    participant: callParticipantSchema,
    sessionId: sessionIdSchema.shape.sessionId,
    type: z.literal("join"),
  }),
  // A revoke that narrows a connection replaces it, and hands only the connection's own user the token to rejoin with
  z.object({
    authToken: z.string().min(1).max(CALL_AUTH_TOKEN_MAX_LENGTH),
    callSessionId,
    canPublishMicrophone: z.boolean(),
    sessionId: sessionIdSchema.shape.sessionId,
    type: z.literal("rejoin"),
  }),
]);
const joinCallEventSchema = z.object({ data: joinCallPayloadSchema, type: z.literal("joinCall") });
const leaveCallEventSchema = z.object({
  data: z.object({ callSessionId, id: participantId }),
  type: z.literal("leaveCall"),
});
const videoChangedEventSchema = z.object({
  data: z.object({ callSessionId, id: participantId, isCameraEnabled: z.boolean() }),
  type: z.literal("videoChanged"),
});
const handRaisedChangedEventSchema = z.object({
  data: z.object({ callSessionId, id: participantId, isHandRaised: z.boolean() }),
  type: z.literal("handRaisedChanged"),
});
const muteChangedEventSchema = z.object({
  data: z.object({ callSessionId, id: participantId, isMuted: z.boolean() }),
  type: z.literal("muteChanged"),
});
const knockCallEventSchema = z.object({
  data: z.object({ callSessionId, knocker: callParticipantSchema }),
  type: z.literal("knockCall"),
});
const knockerAdmittedEventSchema = z.object({
  data: z.object({ callSessionId, knockerSessionId: sessionIdSchema.shape.sessionId }),
  type: z.literal("knockerAdmitted"),
});
const knockerDismissedEventSchema = z.object({
  data: z.object({ callSessionId, knockerSessionId: sessionIdSchema.shape.sessionId }),
  type: z.literal("knockerDismissed"),
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
