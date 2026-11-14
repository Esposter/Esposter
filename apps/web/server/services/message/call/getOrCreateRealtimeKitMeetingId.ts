import type { RealtimeKitCredentials } from "#server/models/realtimeKit/RealtimeKitCredentials";
import type { Context } from "#server/trpc/context";

import { createRealtimeKitMeeting } from "#server/services/realtimeKit/createRealtimeKitMeeting";
import { callSessionsInMessage } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// The call's meeting, made by its first join. Two first joins can each create one, so the write keeps only the first
// Id that lands and each joiner returns the id that stuck; a meeting that lost the write is left with no participant
export const getOrCreateRealtimeKitMeetingId = async (
  db: Context["db"],
  credentials: RealtimeKitCredentials,
  callSessionId: string,
): Promise<string> => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    columns: { meetingId: true },
    where: { id: { eq: callSessionId } },
  });
  if (callSession?.meetingId) return callSession.meetingId;

  const meetingId = await createRealtimeKitMeeting(credentials);
  const [savedCallSession] = await db
    .update(callSessionsInMessage)
    .set({ meetingId })
    .where(and(eq(callSessionsInMessage.id, callSessionId), isNull(callSessionsInMessage.meetingId)))
    .returning({ meetingId: callSessionsInMessage.meetingId });
  if (savedCallSession) return meetingId;

  const winningCallSession = await db.query.callSessionsInMessage.findFirst({
    columns: { meetingId: true },
    where: { id: { eq: callSessionId } },
  });
  return winningCallSession?.meetingId ?? "";
};
