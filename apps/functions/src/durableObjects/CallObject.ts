import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";
import type {
  CallAccess,
  CallEvent,
  CallJoin,
  CallLeave,
  CallObjectRpc,
  CallParticipant,
  PublishSource,
} from "@esposter/db-schema";

import callMigrations from "#src/durableObjects/call/migrations/migrations.js";
import {
  admittedSessions,
  callState,
  knockers,
  participants,
  realtimeKitParticipants,
} from "#src/durableObjects/call/schema";
import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { HttpMethod } from "#src/models/realtimeKit/HttpMethod";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { addRealtimeKitParticipant } from "#src/services/realtimeKit/addRealtimeKitParticipant";
import { JOIN_PUBLISH_SOURCES } from "#src/services/realtimeKit/constants";
import { createRealtimeKitMeeting } from "#src/services/realtimeKit/createRealtimeKitMeeting";
import { getRealtimeKitCredentials } from "#src/services/realtimeKit/getRealtimeKitCredentials";
import { getRealtimeKitPresetName } from "#src/services/realtimeKit/getRealtimeKitPresetName";
import { removeRealtimeKitParticipant } from "#src/services/realtimeKit/removeRealtimeKitParticipant";
import { requestRealtimeKit } from "#src/services/realtimeKit/requestRealtimeKit";
import { callSessionsInMessage, PublishSource as PublishSourceEnum, relations } from "@esposter/db-schema";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

// The one row the call keeps about itself
const CALL_STATE_ID = 1;

// One Call object per call session. It holds who is in the call and who is knocking.
// It also holds who has been let in and each joined connection's RealtimeKit participant, all in its own SQLite.
// The web Worker authorises a call operation against D1 and then calls the method for it here.
// Each method broadcasts the call's events to the sockets they concern
export class CallObject extends RealtimeObject<CallEvent> implements CallObjectRpc {
  protected readonly db = createDurableObjectDatabase(this.ctx, callMigrations.migrations);
  readonly #callSessionId = getObjectName(this.ctx, "CallObject");
  // The preset update in flight for each connection, so the next one starts from what the last one wrote
  readonly #connectionUpdates = new Map<string, Promise<void>>();
  readonly #core = drizzle(this.env.CORE, { relations });
  // The meeting being made, shared by every join that arrives while the first one is still creating it
  #meetingCreation?: Promise<string>;

  admitKnocker({ callSessionId, knockerSessionId }: { callSessionId: string; knockerSessionId: string }): boolean {
    if (!this.#removeKnocker(knockerSessionId)) return false;
    this.db.insert(admittedSessions).values({ sessionId: knockerSessionId }).onConflictDoNothing().run();
    this.broadcast(
      { data: { callSessionId, knockerSessionId }, type: "knockerAdmitted" },
      { tag: `session:${knockerSessionId}` },
    );
    return true;
  }

  // A revoked session's sockets close first, so the leave that follows finds none left to close.
  // The connection then leaves as a leave does, and its RealtimeKit participant is dropped so its media stops
  async closeSession(sessionId: string): Promise<void> {
    this.closeRevokedSession(sessionId);
    if (this.#removeParticipant(this.#callSessionId, sessionId)) await this.removeConnection({ sessionId });
  }

  dismissKnocker({ callSessionId, knockerSessionId }: { callSessionId: string; knockerSessionId: string }): boolean {
    if (!this.#removeKnocker(knockerSessionId)) return false;
    this.broadcast(
      { data: { callSessionId, knockerSessionId }, type: "knockerDismissed" },
      { tag: `session:${knockerSessionId}` },
    );
    return true;
  }

  // Takes every connection of a user out of the call, for a removal, a ban or a timeout. The leave lands first.
  // Each connection is then dropped at RealtimeKit, best-effort.
  // A failed kick is logged rather than failing the eviction
  async evictUser({ callSessionId, userId }: { callSessionId: string; userId: string }): Promise<CallLeave[]> {
    const { meetingId } = this.#readCallState();
    const sessionIds = this.#readSessionIdsOf(userId);
    const leaves = sessionIds.flatMap((sessionId) => {
      const leave = this.#removeParticipant(callSessionId, sessionId);
      return leave ? [leave] : [];
    });
    await Promise.all(
      sessionIds.map((sessionId) =>
        getResultAsync(() => removeRealtimeKitParticipant(meetingId, sessionId)).match(noop, console.error),
      ),
    );
    return leaves;
  }

  // A socket is accepted only for a connection that is in the call or knocking on it, so the call's events reach no one else
  override async fetch(request: Request): Promise<Response> {
    const identity = readSocketIdentity(request.headers);
    if (identity && !this.#checkIsConnected(identity.sessionId))
      return new Response("Not in this call", { status: 403 });
    return super.fetch(request);
  }

  joinCall({
    callSessionId,
    isAdmissionRequired,
    participant,
  }: {
    callSessionId: string;
    isAdmissionRequired: boolean;
    participant: CallParticipant;
  }): Promise<CallJoin | null> {
    return this.#joinCallAs(callSessionId, participant, isAdmissionRequired);
  }

  knockCall({
    callSessionId,
    doorkeeperUserId,
    knocker,
  }: {
    callSessionId: string;
    doorkeeperUserId: string;
    knocker: CallParticipant;
  }): void {
    this.db.insert(knockers).values(knocker).onConflictDoUpdate({ set: knocker, target: knockers.id }).run();
    // Only the doorkeeper hears of a knock: the knocker hears of its own admission or dismissal on its own socket
    this.broadcast({ data: { callSessionId, knocker }, type: "knockCall" }, { tag: `user:${doorkeeperUserId}` });
  }

  leaveCall({ callSessionId, sessionId }: { callSessionId: string; sessionId: string }): CallLeave | null {
    return this.#removeParticipant(callSessionId, sessionId);
  }

  participantJoined({ callSessionId, participant }: { callSessionId: string; participant: CallParticipant }): void {
    if (!this.#readParticipant(participant.id)) this.#addParticipant(callSessionId, participant);
  }

  // A connection a revoke is replacing is kicked by that revoke, and the kick is not its user leaving.
  // The replacement is added under the same session, so the participant stays in the call
  participantLeft({ callSessionId, sessionId }: { callSessionId: string; sessionId: string }): CallLeave | null {
    if (this.#readRealtimeKitParticipant(sessionId)?.isRejoining) return null;
    return this.#removeParticipant(callSessionId, sessionId);
  }

  readAccess({ sessionId }: { sessionId: string }): CallAccess {
    return {
      isAdmitted: Boolean(
        this.db.select().from(admittedSessions).where(eq(admittedSessions.sessionId, sessionId)).get(),
      ),
      isJoined: this.#readParticipant(sessionId) !== undefined,
      isKnocking: this.#readKnocker(sessionId) !== undefined,
    };
  }

  readParticipantMap(): Map<string, CallParticipant> {
    return new Map(
      this.db
        .select()
        .from(participants)
        .all()
        .map((participant) => [participant.id, participant]),
    );
  }

  // Drops one connection at RealtimeKit, for a connection the call does not admit
  async removeConnection({ sessionId }: { sessionId: string }): Promise<void> {
    const { meetingId } = this.#readCallState();
    await getResultAsync(() => removeRealtimeKitParticipant(meetingId, sessionId)).match(noop, console.error);
  }

  setCameraEnabled({
    callSessionId,
    isCameraEnabled,
    sessionId,
  }: {
    callSessionId: string;
    isCameraEnabled: boolean;
    sessionId: string;
  }): boolean {
    const isUpdated = this.#updateParticipant(sessionId, { isCameraEnabled });
    if (isUpdated) this.broadcast({ data: { callSessionId, id: sessionId, isCameraEnabled }, type: "videoChanged" });
    return isUpdated;
  }

  setHandRaised({
    callSessionId,
    isHandRaised,
    sessionId,
  }: {
    callSessionId: string;
    isHandRaised: boolean;
    sessionId: string;
  }): boolean {
    const isUpdated = this.#updateParticipant(sessionId, { isHandRaised });
    if (isUpdated) this.broadcast({ data: { callSessionId, id: sessionId, isHandRaised }, type: "handRaisedChanged" });
    return isUpdated;
  }

  setMuted({
    callSessionId,
    isMuted,
    sessionId,
  }: {
    callSessionId: string;
    isMuted: boolean;
    sessionId: string;
  }): boolean {
    const isUpdated = this.#updateParticipant(sessionId, { isMuted });
    if (isUpdated) this.broadcast({ data: { callSessionId, id: sessionId, isMuted }, type: "muteChanged" });
    return isUpdated;
  }

  // Takes publishing away from, or gives it back to, every connection a user holds in the call.
  // It is computed from what each connection may publish now rather than written from a fixed set.
  // Because of that, one moderation's grant never undoes another's revoke.
  // A force-muted presenter whose screen share is stopped stays muted.
  // Each connection's update waits for the one before it.
  // Otherwise two moderations reading one set would each restore what the other took.
  // A grant switches the preset in place. A revoke that narrows it replaces the connection instead.
  // A preset change does not take a track already live off the air.
  // So the connection is kicked and added back under the narrower preset.
  // Only its own session is handed the new token to rejoin with.
  // A failure fails the action, since nothing else holds the enforcement
  async updatePresets({
    callSessionId,
    isGranted,
    sources,
    userId,
  }: {
    callSessionId: string;
    isGranted: boolean;
    sources: PublishSource[];
    userId: string;
  }): Promise<void> {
    const credentials = getRealtimeKitCredentials();
    const { meetingId } = this.#readCallState();
    if (!credentials || !meetingId) return;

    await Promise.all(
      this.#readSessionIdsOf(userId).map((sessionId) =>
        this.#serializeConnection(sessionId, () =>
          this.#updateConnection({ callSessionId, credentials, isGranted, meetingId, sessionId, sources }),
        ),
      ),
    );
  }

  #addJoinedParticipant(
    callSessionId: string,
    participant: CallParticipant,
    {
      authToken,
      meetingId,
      realtimeKit,
    }: { authToken: string; meetingId: string; realtimeKit?: { id: string; publishSources: PublishSource[] } },
  ): CallJoin {
    const isFirstJoiner = this.#addParticipant(callSessionId, participant);
    if (realtimeKit) {
      const realtimeKitRow = {
        isRejoining: false,
        publishSources: realtimeKit.publishSources,
        realtimeKitParticipantId: realtimeKit.id,
      };
      this.db
        .insert(realtimeKitParticipants)
        .values({ ...realtimeKitRow, sessionId: participant.id })
        .onConflictDoUpdate({ set: realtimeKitRow, target: realtimeKitParticipants.sessionId })
        .run();
    }
    return { authToken, isFirstJoiner, meetingId, participantMap: this.readParticipantMap() };
  }

  // Adds a connection as a participant and announces it, unless it is already one. Returns whether it started the call
  #addParticipant(callSessionId: string, participant: CallParticipant): boolean {
    const joinedParticipant = { ...participant, isCameraEnabled: false };
    const isFirstJoiner = !this.#checkHasParticipants();
    this.db
      .insert(participants)
      .values(joinedParticipant)
      .onConflictDoUpdate({ set: joinedParticipant, target: participants.id })
      .run();
    if (isFirstJoiner) this.#writeCallState({ startedAt: new Date() });
    this.broadcast(
      {
        data: { callSessionId, participant: joinedParticipant, sessionId: participant.id, type: "join" },
        type: "joinCall",
      },
      { excludeTag: `session:${participant.id}` },
    );
    return isFirstJoiner;
  }

  #checkHasParticipants(): boolean {
    return this.db.select({ id: participants.id }).from(participants).limit(1).all().length > 0;
  }

  #checkIsConnected(sessionId: string): boolean {
    return this.#readParticipant(sessionId) !== undefined || this.#readKnocker(sessionId) !== undefined;
  }

  #closeSessionSockets(sessionId: string): void {
    for (const socket of this.ctx.getWebSockets(`session:${sessionId}`)) socket.close(1000, "Left the call");
  }

  #consumeAdmission(sessionId: string): boolean {
    return (
      this.db.delete(admittedSessions).where(eq(admittedSessions.sessionId, sessionId)).returning().all().length > 0
    );
  }

  async #createMeetingId(callSessionId: string, credentials: RealtimeKitCredentials): Promise<string> {
    const meetingId = await createRealtimeKitMeeting(credentials);
    await this.#core
      .update(callSessionsInMessage)
      .set({ meetingId })
      .where(eq(callSessionsInMessage.id, callSessionId));
    this.#writeCallState({ meetingId });
    return meetingId;
  }

  // The last participant leaving ends the call. Its knockers are dismissed and its admissions cleared.
  // Its duration is returned in seconds for the summary written into the room. A call with no start time reports zero
  #endCall(callSessionId: string): number {
    const { startedAt } = this.#readCallState();
    const callDurationSeconds = startedAt ? Math.round((Date.now() - startedAt.getTime()) / 1000) : 0;
    for (const { id } of this.db.delete(knockers).returning({ id: knockers.id }).all())
      this.broadcast(
        { data: { callSessionId, knockerSessionId: id }, type: "knockerDismissed" },
        { tag: `session:${id}` },
      );
    this.db.delete(admittedSessions).run();
    this.#writeCallState({ startedAt: null });
    return callDurationSeconds;
  }

  async #joinCallAs(
    callSessionId: string,
    participant: CallParticipant,
    isAdmissionRequired: boolean,
  ): Promise<CallJoin | null> {
    // Consumed before the first await, so a second join by the same connection finds nothing to consume
    if (isAdmissionRequired && !this.#consumeAdmission(participant.id)) return null;

    const credentials = getRealtimeKitCredentials();
    // A deployment without RealtimeKit joins the call with no media server, as it did before any media server was set up
    if (!credentials) return this.#addJoinedParticipant(callSessionId, participant, { authToken: "", meetingId: "" });

    const meetingId = await this.#readOrCreateMeetingId(callSessionId, credentials);
    const realtimeKitParticipant = await addRealtimeKitParticipant(
      credentials,
      meetingId,
      participant,
      getRealtimeKitPresetName(JOIN_PUBLISH_SOURCES),
    );
    return this.#addJoinedParticipant(callSessionId, participant, {
      authToken: realtimeKitParticipant.token,
      meetingId,
      realtimeKit: { id: realtimeKitParticipant.id, publishSources: [...JOIN_PUBLISH_SOURCES] },
    });
  }

  #readCallState(): { meetingId: string; startedAt: Date | null } {
    return (
      this.db.select().from(callState).where(eq(callState.id, CALL_STATE_ID)).get() ?? {
        meetingId: "",
        startedAt: null,
      }
    );
  }

  #readKnocker(sessionId: string) {
    return this.db.select().from(knockers).where(eq(knockers.id, sessionId)).get();
  }

  // The meeting is made by the first join.
  // It is kept on the call's own row and on its session row, which the webhook finds the call by.
  // A join that arrives while it is being made shares that creation rather than making a second meeting
  #readOrCreateMeetingId(callSessionId: string, credentials: RealtimeKitCredentials): Promise<string> {
    const { meetingId } = this.#readCallState();
    if (meetingId) return Promise.resolve(meetingId);

    this.#meetingCreation ??= getResultAsync(() => this.#createMeetingId(callSessionId, credentials)).match(
      (createdMeetingId) => createdMeetingId,
      (error) => {
        this.#meetingCreation = undefined;
        throw error;
      },
    );
    return this.#meetingCreation;
  }

  #readParticipant(sessionId: string) {
    return this.db.select().from(participants).where(eq(participants.id, sessionId)).get();
  }

  #readRealtimeKitParticipant(sessionId: string) {
    return this.db.select().from(realtimeKitParticipants).where(eq(realtimeKitParticipants.sessionId, sessionId)).get();
  }

  #readSessionIdsOf(userId: string): string[] {
    return this.db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.userId, userId))
      .all()
      .map(({ id }) => id);
  }

  #removeKnocker(sessionId: string): boolean {
    return this.db.delete(knockers).where(eq(knockers.id, sessionId)).returning().all().length > 0;
  }

  #removeParticipant(callSessionId: string, sessionId: string): CallLeave | null {
    const participant = this.#readParticipant(sessionId);
    if (!participant) return null;

    this.db.delete(participants).where(eq(participants.id, sessionId)).run();
    this.db.delete(realtimeKitParticipants).where(eq(realtimeKitParticipants.sessionId, sessionId)).run();
    this.broadcast(
      { data: { callSessionId, id: sessionId }, type: "leaveCall" },
      { excludeTag: `session:${sessionId}` },
    );
    this.#closeSessionSockets(sessionId);
    return {
      callDurationSeconds: this.#checkHasParticipants() ? null : this.#endCall(callSessionId),
      sessionId,
      userId: participant.userId,
    };
  }

  // One update per connection at a time, each waiting for the one before it, and a failure is thrown to the caller
  async #serializeConnection(sessionId: string, update: () => Promise<void>): Promise<void> {
    const previousUpdate = this.#connectionUpdates.get(sessionId);
    const currentUpdate = (async () => {
      await Promise.allSettled([previousUpdate]);
      await update();
    })();
    this.#connectionUpdates.set(sessionId, currentUpdate);
    const result = await getResultAsync(() => currentUpdate);
    if (this.#connectionUpdates.get(sessionId) === currentUpdate) this.#connectionUpdates.delete(sessionId);
    result.match(noop, (error) => {
      throw error;
    });
  }

  async #updateConnection({
    callSessionId,
    credentials,
    isGranted,
    meetingId,
    sessionId,
    sources,
  }: {
    callSessionId: string;
    credentials: RealtimeKitCredentials;
    isGranted: boolean;
    meetingId: string;
    sessionId: string;
    sources: PublishSource[];
  }): Promise<void> {
    const realtimeKitParticipant = this.#readRealtimeKitParticipant(sessionId);
    if (!realtimeKitParticipant) return;

    const { publishSources: currentSources, realtimeKitParticipantId } = realtimeKitParticipant;
    const publishSources = isGranted
      ? [...new Set([...currentSources, ...sources])]
      : currentSources.filter((source) => !sources.includes(source));
    if (isGranted) {
      await requestRealtimeKit(credentials, {
        body: { preset_name: getRealtimeKitPresetName(publishSources) },
        method: HttpMethod.Patch,
        path: `/meetings/${meetingId}/participants/${realtimeKitParticipantId}`,
        schema: z.unknown().optional(),
      });
      this.#updateRealtimeKitParticipant(sessionId, { publishSources });
    } else if (publishSources.length < currentSources.length) {
      // Flagged while the kick is in flight.
      // The webhook reads that kick as this connection being replaced rather than its participant leaving
      this.#updateRealtimeKitParticipant(sessionId, { isRejoining: true });
      await withFinalizerAsync(
        async () => {
          await removeRealtimeKitParticipant(meetingId, sessionId);
          // A participant who left while the kick was in flight has no call left to rejoin
          const participant = this.#readParticipant(sessionId);
          if (!participant) return;

          const addedParticipant = await addRealtimeKitParticipant(
            credentials,
            meetingId,
            participant,
            getRealtimeKitPresetName(publishSources),
          );
          this.#updateRealtimeKitParticipant(sessionId, {
            isRejoining: false,
            publishSources,
            realtimeKitParticipantId: addedParticipant.id,
          });
          this.broadcast(
            {
              data: {
                authToken: addedParticipant.token,
                callSessionId,
                canPublishMicrophone: publishSources.includes(PublishSourceEnum.Microphone),
                sessionId,
                type: "rejoin",
              },
              type: "joinCall",
            },
            { tag: `session:${sessionId}` },
          );
        },
        () => {
          this.#updateRealtimeKitParticipant(sessionId, { isRejoining: false });
        },
      );
    }
  }

  #updateParticipant(
    sessionId: string,
    values: Partial<Pick<CallParticipant, "isCameraEnabled" | "isHandRaised" | "isMuted">>,
  ): boolean {
    return this.db.update(participants).set(values).where(eq(participants.id, sessionId)).returning().all().length > 0;
  }

  #updateRealtimeKitParticipant(sessionId: string, values: Partial<typeof realtimeKitParticipants.$inferInsert>): void {
    this.db.update(realtimeKitParticipants).set(values).where(eq(realtimeKitParticipants.sessionId, sessionId)).run();
  }

  #writeCallState(values: Partial<typeof callState.$inferInsert>): void {
    this.db
      .insert(callState)
      .values({ id: CALL_STATE_ID, meetingId: "", startedAt: null, ...values })
      .onConflictDoUpdate({ set: values, target: callState.id })
      .run();
  }
}
