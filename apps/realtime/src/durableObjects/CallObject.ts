import type { ParticipantFlags } from "#src/models/call/ParticipantFlags";
import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";
import type {
  CallAccess,
  CallEvent,
  CallJoin,
  CallLeave,
  CallObjectRpc,
  CallParticipant,
  CallParticipantProfile,
  CallParticipantRow,
  PublishSource,
} from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { HttpMethod } from "#src/models/realtimeKit/HttpMethod";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { createObjectHandle } from "#src/services/durableObject/createObjectHandle";
import { getObjectName } from "#src/services/durableObject/getObjectName";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { addRealtimeKitParticipant } from "#src/services/realtimeKit/addRealtimeKitParticipant";
import { JOIN_PUBLISH_SOURCES } from "#src/services/realtimeKit/constants";
import { createRealtimeKitMeeting } from "#src/services/realtimeKit/createRealtimeKitMeeting";
import { getRealtimeKitCredentials } from "#src/services/realtimeKit/getRealtimeKitCredentials";
import { getRealtimeKitPresetName } from "#src/services/realtimeKit/getRealtimeKitPresetName";
import { removeRealtimeKitParticipant } from "#src/services/realtimeKit/removeRealtimeKitParticipant";
import { requestRealtimeKit } from "#src/services/realtimeKit/requestRealtimeKit";
import { getObjectStub } from "@esposter/db";
import {
  admittedSessions,
  callSessionsInMessage,
  callState,
  getSessionSocketTag,
  getUserSocketTag,
  knockers,
  participants,
  PublishSource as PublishSourceEnum,
  realtimeKitParticipants,
  relations,
  TOMBSTONE_RETENTION_MS,
  TopicKind,
} from "@esposter/db-schema";
import callMigrations from "@esposter/db-schema/objects/call/migrations/migrations";
import { getResultAsync, noop, takeOne, withFinalizerAsync } from "@esposter/shared";
import { and, eq, isNotNull, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { v7 } from "uuid";
import { z } from "zod";

// The one row the call keeps about itself
const CALL_STATE_ID = 1;

// A participant row as a member is shown it: its columns and version, without the session it joined under
const participantColumns = {
  deletedAt: participants.deletedAt,
  id: participants.id,
  image: participants.image,
  isCameraEnabled: participants.isCameraEnabled,
  isHandRaised: participants.isHandRaised,
  isMuted: participants.isMuted,
  name: participants.name,
  userId: participants.userId,
  version: participants.version,
};

// A joined connection as the server knows it, its session included
type Connection = Pick<typeof participants.$inferSelect, "id" | "sessionId" | "userId">;

// One Call object per call session. It holds who is in the call and who is knocking.
// It also holds who has been let in and each joined connection's RealtimeKit participant, all in its own SQLite.
// A connection is named to the members by its participant or knocker id, a fresh one per join or knock, and is held
// By its auth session, which never leaves this object.
// The web Worker authorises a call operation against D1 and then calls the method for it here.
// Each method broadcasts the call's events to the sockets they concern
export class CallObject extends RealtimeObject<CallEvent, CallObjectRpc> implements CallObjectRpc {
  protected readonly db = createObjectHandle(createDurableObjectDatabase(this.ctx, callMigrations.migrations), {
    owned: true,
  });
  protected readonly topicKind = TopicKind.Call;
  readonly #callSessionId = getObjectName(this.ctx, "CallObject");
  readonly #core = createObjectHandle(drizzle(this.env.CORE, { relations }));
  // The meeting being made, shared by every join that arrives while the first one is still creating it
  #meetingCreation?: Promise<string> | undefined;
  // The work in flight for each key, a session's join or a connection's preset update, so the next for that key starts after it
  readonly #serialized = new Map<string, Promise<unknown>>();

  admitKnocker({ callSessionId, knockerId }: { callSessionId: string; knockerId: string }): boolean {
    const knocker = this.#removeKnocker(knockerId);
    if (!knocker) return false;
    this.db.insert(admittedSessions).values({ sessionId: knocker.sessionId }).onConflictDoNothing().run();
    this.broadcast(
      { data: { callSessionId }, type: "knockerAdmitted" },
      { tag: getSessionSocketTag(knocker.sessionId) },
    );
    return true;
  }

  // A revoked session's sockets close first, so the leave that follows finds none left to close.
  // The connection then leaves as a leave does, and its RealtimeKit participant is dropped so its media stops. The
  // Leave is handed back, so the departure that ends a room call writes its summary as every other departure does
  async closeSession(sessionId: string): Promise<CallLeave | null> {
    this.closeRevokedSession(sessionId);
    const participant = this.#readParticipantBySession(sessionId);
    if (!participant) return null;

    const leave = this.#removeParticipant(this.#callSessionId, participant);
    await this.removeConnection({ participantId: participant.id });
    return leave;
  }

  dismissKnocker({ callSessionId, knockerId }: { callSessionId: string; knockerId: string }): boolean {
    const knocker = this.#removeKnocker(knockerId);
    if (!knocker) return false;
    this.#broadcastKnockerDismissed(callSessionId, knocker.sessionId);
    return true;
  }

  // Takes every connection of a user out of the call, for a removal, a ban or a timeout. The leave lands first.
  // Each connection is then dropped at RealtimeKit, best-effort.
  // A failed kick is logged rather than failing the eviction
  async evictUser({ callSessionId, userId }: { callSessionId: string; userId: string }): Promise<CallLeave[]> {
    const evicted = this.#readConnectionsOf(userId);
    const leaves = evicted.map((connection) => this.#removeParticipant(callSessionId, connection));
    await Promise.all(evicted.map(({ id }) => this.removeConnection({ participantId: id })));
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
    sessionId,
  }: {
    callSessionId: string;
    isAdmissionRequired: boolean;
    participant: CallParticipantProfile;
    sessionId: string;
  }): Promise<CallJoin | null> {
    // A session's joins run one at a time, so a join that overlaps another finds the participant the first one recorded
    return this.#serialize(sessionId, () =>
      this.#joinCallAs(callSessionId, sessionId, participant, isAdmissionRequired),
    );
  }

  knockCall({
    callSessionId,
    doorkeeperUserId,
    knocker,
    sessionId,
  }: {
    callSessionId: string;
    doorkeeperUserId: string;
    knocker: CallParticipantProfile;
    sessionId: string;
  }): void {
    // A session knocks under one id however often it knocks, so the doorkeeper's lobby holds it once
    const id = this.#readKnockerBySession(sessionId)?.id ?? v7();
    this.db
      .insert(knockers)
      .values({ ...knocker, id, sessionId })
      .onConflictDoUpdate({ set: { ...knocker, sessionId }, target: knockers.id })
      .run();
    // Only the doorkeeper hears of a knock: the knocker hears of its own admission or dismissal on its own socket
    this.broadcast(
      { data: { callSessionId, knocker: { ...knocker, id } }, type: "knockCall" },
      { tag: getUserSocketTag(doorkeeperUserId) },
    );
  }

  leaveCall({ callSessionId, sessionId }: { callSessionId: string; sessionId: string }): CallLeave | null {
    const participant = this.#readParticipantBySession(sessionId);
    return participant ? this.#removeParticipant(callSessionId, participant) : null;
  }

  // A connection a revoke is replacing is kicked by that revoke, and the kick is not its user leaving.
  // The replacement is added under the same participant, so the participant stays in the call. The kick's webhook can land
  // After the replacement is added, so a leave from before the current connection was added is the kicked one's too
  participantLeft({
    callSessionId,
    leftAt,
    participantId,
  }: {
    callSessionId: string;
    leftAt: Date;
    participantId: string;
  }): CallLeave | null {
    const realtimeKitParticipant = this.#readRealtimeKitParticipant(participantId);
    if (realtimeKitParticipant?.isRejoining || (realtimeKitParticipant && leftAt < realtimeKitParticipant.connectedAt))
      return null;
    const participant = this.#readParticipant(participantId);
    return participant ? this.#removeParticipant(callSessionId, participant) : null;
  }

  readAccess({ sessionId }: { sessionId: string }): CallAccess {
    const participant = this.#readParticipantBySession(sessionId);
    return {
      isAdmitted: Boolean(
        this.db.select().from(admittedSessions).where(eq(admittedSessions.sessionId, sessionId)).get(),
      ),
      isJoined: participant !== undefined,
      isKnocking: this.#readKnockerBySession(sessionId) !== undefined,
      participantId: participant?.id ?? "",
    };
  }

  // Every row the call holds, tombstones included, so a read that answered before a leave loses to the leave's row
  readParticipantMap(): Map<string, CallParticipantRow> {
    return new Map(
      this.db
        .select(participantColumns)
        .from(participants)
        .all()
        .map((participant) => [participant.id, participant]),
    );
  }

  // The user a participant is a connection of, read for the webhook that checks its admission. Empty when the call holds no
  // Such participant, which is a connection the call no longer admits
  readParticipantUserId({ participantId }: { participantId: string }): string {
    return this.#readParticipant(participantId)?.userId ?? "";
  }

  // Drops one connection at RealtimeKit, for a connection the call does not admit
  async removeConnection({ participantId }: { participantId: string }): Promise<void> {
    const { meetingId } = this.#readCallState();
    await getResultAsync(() => removeRealtimeKitParticipant(meetingId, participantId)).match(noop, console.error);
  }

  setCameraEnabled({
    callSessionId,
    isCameraEnabled,
    sessionId,
  }: {
    callSessionId: string;
    isCameraEnabled: boolean;
    sessionId: string;
  }): CallParticipantRow | null {
    return this.#updateFlag(eq(participants.sessionId, sessionId), { isCameraEnabled }, (participant) => ({
      data: { callSessionId, participant },
      type: "videoChanged",
    }));
  }

  setHandRaised({
    callSessionId,
    isHandRaised,
    participantId,
  }: {
    callSessionId: string;
    isHandRaised: boolean;
    participantId: string;
  }): CallParticipantRow | null {
    return this.#updateFlag(eq(participants.id, participantId), { isHandRaised }, (participant) => ({
      data: { callSessionId, participant },
      type: "handRaisedChanged",
    }));
  }

  setMuted({
    callSessionId,
    isMuted,
    sessionId,
  }: {
    callSessionId: string;
    isMuted: boolean;
    sessionId: string;
  }): CallParticipantRow | null {
    return this.#updateFlag(eq(participants.sessionId, sessionId), { isMuted }, (participant) => ({
      data: { callSessionId, participant },
      type: "muteChanged",
    }));
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
      this.#readConnectionsOf(userId).map(({ id, sessionId }) =>
        this.#serialize(id, () =>
          this.#updateConnection({
            callSessionId,
            credentials,
            isGranted,
            meetingId,
            participantId: id,
            sessionId,
            sources,
          }),
        ),
      ),
    );
  }

  #addJoinedParticipant(
    callSessionId: string,
    sessionId: string,
    participant: CallParticipant,
    {
      authToken,
      meetingId,
      realtimeKit,
    }: { authToken: string; meetingId: string; realtimeKit?: { id: string; publishSources: PublishSource[] } },
  ): CallJoin {
    const isFirstJoiner = this.#addParticipant(callSessionId, sessionId, participant);
    if (realtimeKit) {
      const realtimeKitRow = {
        connectedAt: new Date(),
        isRejoining: false,
        publishSources: realtimeKit.publishSources,
        realtimeKitParticipantId: realtimeKit.id,
      };
      this.db
        .insert(realtimeKitParticipants)
        .values({ ...realtimeKitRow, participantId: participant.id })
        .onConflictDoUpdate({ set: realtimeKitRow, target: realtimeKitParticipants.participantId })
        .run();
    }
    return {
      authToken,
      isFirstJoiner,
      meetingId,
      participantId: participant.id,
      participantMap: this.readParticipantMap(),
    };
  }

  // Adds a connection as a participant and announces it. Returns whether it started the call. A session that left is
  // Revived under the id this join minted: its row is the one the session's unique column names, so the upsert keys on that
  // Column and its conflict branch clears the tombstone at the version the row continues from
  #addParticipant(callSessionId: string, sessionId: string, participant: CallParticipant): boolean {
    this.#purgeTombstones();
    const joinedParticipant = { ...participant, deletedAt: null, isCameraEnabled: false, sessionId };
    const isFirstJoiner = !this.#checkHasParticipants();
    const writtenParticipant = takeOne(
      this.db
        .insert(participants)
        .values(joinedParticipant)
        .onConflictDoUpdate({ set: joinedParticipant, target: participants.sessionId })
        .returning(participantColumns)
        .all(),
      0,
    );
    if (isFirstJoiner) this.#writeCallState({ startedAt: new Date() });
    this.broadcast(
      { data: { callSessionId, participant: writtenParticipant, type: "join" }, type: "joinCall" },
      { excludeTag: getSessionSocketTag(sessionId) },
    );
    return isFirstJoiner;
  }

  // A dismissed knocker hears of it on its own session's socket, the one it knocked with
  #broadcastKnockerDismissed(callSessionId: string, sessionId: string): void {
    this.broadcast({ data: { callSessionId }, type: "knockerDismissed" }, { tag: getSessionSocketTag(sessionId) });
  }

  #checkHasParticipants(): boolean {
    const livingParticipants = this.db
      .select({ id: participants.id })
      .from(participants)
      .where(isNull(participants.deletedAt))
      .limit(1)
      .all();
    return livingParticipants.length > 0;
  }

  #checkIsConnected(sessionId: string): boolean {
    return (
      this.#readParticipantBySession(sessionId) !== undefined || this.#readKnockerBySession(sessionId) !== undefined
    );
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
    for (const { sessionId } of this.db.delete(knockers).returning({ sessionId: knockers.sessionId }).all())
      this.#broadcastKnockerDismissed(callSessionId, sessionId);
    this.db.delete(admittedSessions).run();
    this.#writeCallState({ startedAt: null });
    return callDurationSeconds;
  }

  async #joinCallAs(
    callSessionId: string,
    sessionId: string,
    profile: CallParticipantProfile,
    isAdmissionRequired: boolean,
  ): Promise<CallJoin | null> {
    // Consumed before the first await, so a second join by the same connection finds nothing to consume
    if (isAdmissionRequired && !this.#consumeAdmission(sessionId)) return null;

    // A connection that is already in the call keeps its participant id, and a join after a leave is named afresh
    const participant: CallParticipant = { ...profile, id: this.#readParticipantBySession(sessionId)?.id ?? v7() };
    const credentials = getRealtimeKitCredentials();
    // A deployment without RealtimeKit joins the call with no media server, as it did before any media server was set up
    if (!credentials)
      return this.#addJoinedParticipant(callSessionId, sessionId, participant, { authToken: "", meetingId: "" });

    const meetingId = await this.#readOrCreateMeetingId(callSessionId, credentials);
    const realtimeKitParticipant = await addRealtimeKitParticipant(
      credentials,
      meetingId,
      participant,
      getRealtimeKitPresetName(JOIN_PUBLISH_SOURCES),
    );
    return this.#addJoinedParticipant(callSessionId, sessionId, participant, {
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

  #readConnectionsOf(userId: string): Connection[] {
    return this.db
      .select({ id: participants.id, sessionId: participants.sessionId, userId: participants.userId })
      .from(participants)
      .where(and(eq(participants.userId, userId), isNull(participants.deletedAt)))
      .all();
  }

  #readKnockerBySession(sessionId: string) {
    return this.db.select().from(knockers).where(eq(knockers.sessionId, sessionId)).get();
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

  // A tombstone is no connection, so a read of the live participant takes live rows only
  #readParticipant(participantId: string) {
    return this.db
      .select()
      .from(participants)
      .where(and(eq(participants.id, participantId), isNull(participants.deletedAt)))
      .get();
  }

  #readParticipantBySession(sessionId: string) {
    return this.db
      .select()
      .from(participants)
      .where(and(eq(participants.sessionId, sessionId), isNull(participants.deletedAt)))
      .get();
  }

  #readRealtimeKitParticipant(participantId: string) {
    return this.db
      .select()
      .from(realtimeKitParticipants)
      .where(eq(realtimeKitParticipants.participantId, participantId))
      .get();
  }

  #removeKnocker(knockerId: string) {
    return this.db
      .delete(knockers)
      .where(eq(knockers.id, knockerId))
      .returning({ sessionId: knockers.sessionId })
      .all()[0];
  }

  // A leave tombstones the connection's row at its next version, so the row a read or a late frame carries loses to it
  #removeParticipant(callSessionId: string, participant: Connection): CallLeave {
    this.#purgeTombstones();
    const leftParticipant = takeOne(
      this.db
        .update(participants)
        .set({ deletedAt: new Date() })
        .where(eq(participants.id, participant.id))
        .returning(participantColumns)
        .all(),
      0,
    );
    this.db.delete(realtimeKitParticipants).where(eq(realtimeKitParticipants.participantId, participant.id)).run();
    this.broadcast(
      { data: { callSessionId, participant: leftParticipant }, type: "leaveCall" },
      { excludeTag: getSessionSocketTag(participant.sessionId) },
    );
    this.closeSockets(getSessionSocketTag(participant.sessionId), 1000, "Left the call");
    // A person's last session out of the call takes it off the calls their object closes a revoked session on
    if (this.#readConnectionsOf(participant.userId).length === 0)
      this.ctx.waitUntil(
        getResultAsync(() => getObjectStub(this.env.USER, participant.userId).removeJoinedCall(callSessionId)).match(
          noop,
          console.error,
        ),
      );
    return {
      callDurationSeconds: this.#checkHasParticipants() ? null : this.#endCall(callSessionId),
      participant: leftParticipant,
      sessionId: participant.sessionId,
      userId: participant.userId,
    };
  }

  // A tombstone past its retention is removed at the object's next write. A call object has no alarm, so its own writes
  // Are where the purge runs, and a client that still holds the row forgets it at the same age
  #purgeTombstones(): void {
    this.db
      .delete(participants)
      .where(
        and(
          isNotNull(participants.deletedAt),
          lt(participants.deletedAt, new Date(Date.now() - TOMBSTONE_RETENTION_MS)),
        ),
      )
      .run();
  }

  // One piece of work per key at a time, each starting once the one before it for that key has settled. Its own result
  // Or failure is what the caller gets back
  #serialize<T>(key: string, work: () => Promise<T>): Promise<T> {
    const previous = this.#serialized.get(key) ?? Promise.resolve();
    const current = withFinalizerAsync(
      async () => {
        await getResultAsync(() => previous);
        return work();
      },
      () => {
        if (this.#serialized.get(key) === current) this.#serialized.delete(key);
      },
    );
    this.#serialized.set(key, current);
    return current;
  }

  async #updateConnection({
    callSessionId,
    credentials,
    isGranted,
    meetingId,
    participantId,
    sessionId,
    sources,
  }: {
    callSessionId: string;
    credentials: RealtimeKitCredentials;
    isGranted: boolean;
    meetingId: string;
    participantId: string;
    sessionId: string;
    sources: PublishSource[];
  }): Promise<void> {
    const realtimeKitParticipant = this.#readRealtimeKitParticipant(participantId);
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
      this.#updateRealtimeKitParticipant(participantId, { publishSources });
    } else if (publishSources.length < currentSources.length) {
      // Flagged while the kick is in flight.
      // The webhook reads that kick as this connection being replaced rather than its participant leaving
      this.#updateRealtimeKitParticipant(participantId, { isRejoining: true });
      await withFinalizerAsync(
        async () => {
          await removeRealtimeKitParticipant(meetingId, participantId);
          // A participant who left while the kick was in flight has no call left to rejoin
          const participant = this.#readParticipant(participantId);
          if (!participant) return;

          const addedParticipant = await addRealtimeKitParticipant(
            credentials,
            meetingId,
            participant,
            getRealtimeKitPresetName(publishSources),
          );
          this.#updateRealtimeKitParticipant(participantId, {
            connectedAt: new Date(),
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
                type: "rejoin",
              },
              type: "joinCall",
            },
            { tag: getSessionSocketTag(sessionId) },
          );
        },
        () => {
          this.#updateRealtimeKitParticipant(participantId, { isRejoining: false });
        },
      );
    }
  }

  // Writes one of a participant's flags, and broadcasts the row it left for the event only when a live participant was updated
  #updateFlag(
    where: SQL,
    values: ParticipantFlags,
    toEvent: (participant: CallParticipantRow) => CallEvent,
  ): CallParticipantRow | null {
    const [updatedParticipant] = this.db
      .update(participants)
      .set(values)
      .where(and(where, isNull(participants.deletedAt)))
      .returning(participantColumns)
      .all();
    if (!updatedParticipant) return null;

    this.broadcast(toEvent(updatedParticipant));
    return updatedParticipant;
  }

  #updateRealtimeKitParticipant(
    participantId: string,
    values: Partial<typeof realtimeKitParticipants.$inferInsert>,
  ): void {
    this.db
      .update(realtimeKitParticipants)
      .set(values)
      .where(eq(realtimeKitParticipants.participantId, participantId))
      .run();
  }

  #writeCallState(values: Partial<typeof callState.$inferInsert>): void {
    this.db
      .insert(callState)
      .values({ id: CALL_STATE_ID, meetingId: "", startedAt: null, ...values })
      .onConflictDoUpdate({ set: values, target: callState.id })
      .run();
  }
}
