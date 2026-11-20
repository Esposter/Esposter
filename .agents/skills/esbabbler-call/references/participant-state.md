# Call participant state — overlay rows

Read when reading, iterating or mutating call participants on the client, or adding a field that describes one.

The client holds participants as overlay rows (`useParticipantStore`, `apps/web/app/store/message/room/call/participant.ts`). `participantTable` (`apps/web/app/services/message/room/call/constants.ts`) keys them by participant id and carries the call each is in beside the call object's row. `callSessionParticipantsMap` is computed over those rows, grouped by call, and never written by a caller, so it is O(1) per lookup and reactive where it is read.

- **Don't add a separate tracking collection** for state already on `CallParticipant` itself. Check whether a new field belongs on the row before adding a parallel map.
- **The tRPC boundary carries `Map<string, CallParticipantRow>` directly** — SuperJSON serializes Maps. A procedure returns the Map, and the store takes its values through `storeCallParticipants`. Never convert to or from arrays at the boundary.
- **Iterate in templates** with `v-for` over the map's `values()`, not via array conversion. Use `.size`, not `.length`.
- **Participants are keyed by participant id, never by auth session.** The id is the one the join gave the caller (`useParticipantStore`'s `participantId`, the single source of the caller's own id) or the one a frame or the participant map names a member by. A session id never reaches the client: a member's view of the call names nobody's sign-in session.
- **Never mutate a held row.** A flag change is a write with an entry (`getParticipantFlagEntry`, `getLeaveCallEntry`), and the row the call object answers with arrives at its version through `storeCallParticipants`. Read a participant through `callSessionParticipantsMap` in the reactive context that uses it, never through a copy kept from an earlier read.
- **A leave is a tombstone, not a removal.** The call object keeps the leaver's row with `deletedAt` set at a higher version, and the store holds it the same way, so an older read or frame that lands after the leave loses to it. The view hides tombstones, so `callSessionParticipantsMap` never lists a leaver.
- **`selfParticipant` computed** — derive `isInCall`, `isMuted`, `isHandRaised` for the caller's own participant from one `computed(() => participantId.value ? callSessionParticipantsMap.value.get(activeCallSessionId.value)?.get(participantId.value) : undefined)` rather than per-value `.find()`/`.includes()`.
- **Never wrap raw store state in a getter for read-only access** — expose `callSessionParticipantsMap` directly via `storeToRefs` (components) or dot access (stores), and inline the guard within each consumer's reactive context. A wrapper that returns a store map by id hides tracked deps, can break reactivity when the reference escapes, and returns a new empty `Map` each call (breaking computed caching). Inline `participantStore.callSessionParticipantsMap.get(id) ?? new Map<string, CallParticipant>()` instead.

- **A join's rows are stored before its connect, never after it.** The frame handlers registered for the joined call keep arriving participant rows while the connect is open. Arrivals are version-gated, so a stale answer cannot overwrite a newer row, but the join stores its answer first so the frames delivered during the connect land on the answer's rows.
- **A session's participant read comes after the call socket is open, and its rows arrive through the arrival gate.** The five participant frames arrive on the call socket: `useSubscribeCallParticipants` registers them with `onCallEvent` on `useConnectionStore` (`apps/web/app/store/realtime/connection.ts`) before it calls `readCallParticipants`. `joinCall` and `joinCallByRoomId` await `openCall` before the session is set as joined, so the read is never issued before the socket can deliver what changes after it. The read keeps no replay: a row a frame delivered during the read is at a newer version than the answer's, so the gate keeps it, and a leaver's tombstone is not brought back by an answer that predates the leave. A socket whose first attempt closes settles that wait too, so the read then goes out without the frames rather than never.
- **A session has one owner, and the joined call is it.** `useCallParticipantSubscribables` registers the joined call's participant frames and reads its session, mounted by the messages layout for a room's call and by the call page for a standalone one. `useCallSubscribables` registers nothing for a viewed room: the call socket opens to a joined or knocking connection alone, so a room whose call the user has not joined has no participants to read. The viewed room's teardown clears `currentRoomCallSessionId` and nothing else: the speakers are the joined call's, cleared by `leaveCall`, which also closes the socket.

```ts
// Rows the overlay holds, read through a computed map keyed by call, reactive deps visible at the call site
// In stores (dot access on store instance):
const self = computed(() =>
  participantStore.participantId
    ? participantStore.callSessionParticipantsMap.get(activeCallSessionId.value)?.get(participantStore.participantId)
    : undefined,
);
const isInCall = computed(() => Boolean(self.value));
const isMuted = computed(() => self.value?.isMuted ?? false);

// In components (storeToRefs):
const { callSessionParticipantsMap } = storeToRefs(participantStore);
const participantMap = computed(() => callSessionParticipantsMap.value.get(callSessionId.value) ?? new Map<string, CallParticipant>());

// template iteration
v-for="participant of participantMap.values()"
```
