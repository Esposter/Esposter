import type { PublishSource } from "#src/models/message/call/PublishSource";

import { createVersionSchema } from "#src/createMetadataSchema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The columns a connection in the call is held by, shared by the participant and knocker tables.
// Both hold the same shape for different states of the same connection
const createCallParticipantColumns = () => ({
  image: text().notNull().default(""),
  isCameraEnabled: integer({ mode: "boolean" }).notNull(),
  isHandRaised: integer({ mode: "boolean" }).notNull(),
  isMuted: integer({ mode: "boolean" }).notNull(),
  name: text().notNull(),
  userId: text().notNull(),
});

// Each connection that has joined. Its id is the participant id the call names it by to every member, minted by each
// Join, so it names the participant in this call alone. The session is the auth session that joined, kept here for the
// Server's guards and kicks and never written into anything a member reads. A leave sets deletedAt rather than deleting
// The row, so a read that answered before the leave cannot bring the connection back; the object purges it once its
// Retention has passed
export const participants = sqliteTable("participants", {
  id: text().primaryKey(),
  sessionId: text().notNull().unique(),
  ...createCallParticipantColumns(),
  deletedAt: integer({ mode: "timestamp_ms" }),
  ...createVersionSchema(),
});

// Each connection waiting for a doorkeeper to let it in, named and held the way a participant is
export const knockers = sqliteTable("knockers", {
  id: text().primaryKey(),
  sessionId: text().notNull().unique(),
  ...createCallParticipantColumns(),
  ...createVersionSchema(),
});

// The knockers a doorkeeper has let past, each consumed by the join it allows
export const admittedSessions = sqliteTable("admittedSessions", {
  sessionId: text().primaryKey(),
  ...createVersionSchema(),
});

// A joined connection's RealtimeKit side, keyed by the participant id RealtimeKit is given as its custom id: the
// Participant it was added as and what it may publish.
// Whether a revoke is replacing it is what the webhook reads, so the kick is not taken for the connection leaving
export const realtimeKitParticipants = sqliteTable("realtimeKitParticipants", {
  // When the current RealtimeKit participant was added. A leave from before it is an earlier connection's, which a
  // Webhook can deliver after its replacement exists
  connectedAt: integer({ mode: "timestamp_ms" }).notNull(),
  isRejoining: integer({ mode: "boolean" }).notNull(),
  participantId: text().primaryKey(),
  publishSources: text({ mode: "json" }).$type<PublishSource[]>().notNull(),
  realtimeKitParticipantId: text().notNull(),
  ...createVersionSchema(),
});

// The one row the call keeps about itself: its RealtimeKit meeting, made by its first join.
// Its start is when that join started the call, which the last leaver reads to report its duration.
// The start is null while nobody is in the call
export const callState = sqliteTable("callState", {
  id: integer().primaryKey(),
  meetingId: text().notNull(),
  startedAt: integer({ mode: "timestamp_ms" }),
  ...createVersionSchema(),
});
