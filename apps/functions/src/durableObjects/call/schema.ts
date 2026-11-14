import type { PublishSource } from "@esposter/db-schema";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The columns a connection in the call is held by, shared by the participant and knocker tables.
// Both hold the same shape for different states of the same connection
const createCallParticipantColumns = () => ({
  image: text(),
  isCameraEnabled: integer({ mode: "boolean" }).notNull(),
  isHandRaised: integer({ mode: "boolean" }).notNull(),
  isMuted: integer({ mode: "boolean" }).notNull(),
  name: text().notNull(),
  userId: text().notNull(),
});

// Each connection that has joined, keyed by its session id, which is the participant id the call names it by
export const participants = sqliteTable("participants", { id: text().primaryKey(), ...createCallParticipantColumns() });

// Each connection waiting for a doorkeeper to let it in
export const knockers = sqliteTable("knockers", { id: text().primaryKey(), ...createCallParticipantColumns() });

// The knockers a doorkeeper has let past, each consumed by the join it allows
export const admittedSessions = sqliteTable("admittedSessions", { sessionId: text().primaryKey() });

// A joined connection's RealtimeKit side: the participant it was added as and what it may publish.
// Whether a revoke is replacing it is what the webhook reads, so the kick is not taken for the connection leaving
export const realtimeKitParticipants = sqliteTable("realtimeKitParticipants", {
  isRejoining: integer({ mode: "boolean" }).notNull(),
  publishSources: text({ mode: "json" }).$type<PublishSource[]>().notNull(),
  realtimeKitParticipantId: text().notNull(),
  sessionId: text().primaryKey(),
});

// The one row the call keeps about itself: its RealtimeKit meeting, made by its first join.
// Its start is when that join started the call, which the last leaver reads to report its duration.
// The start is null while nobody is in the call
export const callState = sqliteTable("callState", {
  id: integer().primaryKey(),
  meetingId: text().notNull(),
  startedAt: integer({ mode: "timestamp_ms" }),
});
