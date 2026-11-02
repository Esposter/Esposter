# Call participant state — Map-based design

Read when reading, iterating or mutating call participants on the client, or adding a field that describes one.

The client `callSessionParticipantsMap` mirrors the server structure for O(1) lookups on all participant mutations (`setParticipantMuted`, `setParticipantHandRaised`, `setParticipantCameraEnabled`, `deleteCallParticipant`) without scanning arrays.

- **Don't add a separate tracking collection** for state already on `CallParticipant`. Check whether a new field belongs on `CallParticipant` itself before adding a parallel map.
- **The tRPC boundary uses `Map<string, CallParticipant>` directly** — SuperJSON natively serializes Maps. Procedures return Maps and `setParticipantMap` stores them as-is. Never convert to/from arrays at the boundary.
- **Iterate in templates** with `v-for="participant of myMap.values()"`, not via array conversion. Use `.size`, not `.length`.
- **Mutate through the reactive chain** — obtain a participant via `callSessionParticipantsMap.value.get(callSessionId)?.get(sessionId)`. Storing it in a local (`const participant = ...get(id)`) is fine: the object is Vue-proxied, so `participant.isMuted = true` triggers reactivity. The restriction is against capturing a _stale reference_ before the reactive lookup (e.g. closing over the map in a non-reactive context).
- **`selfParticipant` computed** — derive `isInCall`, `isMuted`, `isHandRaised` for the current session from one `computed(() => sessionId.value ? callSessionParticipantsMap.value.get(activeCallSessionId.value)?.get(sessionId.value) : undefined)` rather than per-value `.find()`/`.includes()`.
- **Never wrap raw store state in a getter for read-only access** — expose `callSessionParticipantsMap` directly via `storeToRefs` (components) or dot access (stores), and inline the guard within each consumer's reactive context. A `getFooMap(id)` wrapper hides tracked deps, can break reactivity when the reference escapes, and returns a new empty `Map` each call (breaking computed caching). Inline `participantStore.callSessionParticipantsMap.get(id) ?? new Map<string, CallParticipant>()` instead.

- **A join's snapshot is written before its connect, never after it.** The viewed room's subscription keeps applying participant events to the map it holds while the LiveKit connect is open. A snapshot written once the connect resolves replaces that map and discards those events, so `joinCall` and `joinCallByRoomId` call `setParticipantMap` ahead of `connect`.
- **A session's participant read comes after its five events have started, and the answer is replayed over.** `useSubscribeCallParticipants` opens each participant event through `subscribeStarted` (`apps/web/app/services/shared/subscribeStarted.ts`), waits for all five to start, and only then calls `readCallParticipants`. That call keeps every participant write that lands while the read is in flight and applies it over the answer with `mergeSnapshot` (`apps/web/app/services/shared/mergeSnapshot.ts`). A socket that cannot open settles the wait as well, so the read then goes out without the events rather than never.
- **A session has one owner, and the joined call is it.** `useCallParticipantSubscribables` subscribes the joined call's session, mounted by the messages layout for a room's call and by the call page for a standalone one. `useCallSubscribables` subscribes the viewed room's session only while the joined call is not that session, so a session is opened and read once. Joining the viewed call hands its subscription over, and leaving it while the room is still viewed hands it back. The viewed room's teardown clears `currentRoomCallSessionId` and nothing else: the speakers are the joined call's, cleared by `leaveCall`.

```ts
// Map-based, O(1), state on entity, reactive deps visible at the call site
// In stores (dot access on store instance):
const childMap = computed(() => entityStore.parentMap.get(parentId.value) ?? new Map<string, Entity>());
const self = computed(() => (selfId.value ? childMap.value.get(selfId.value) : undefined));
const isPresent = computed(() => Boolean(self.value));
const isActive = computed(() => self.value?.isActive ?? false);

// In components (storeToRefs):
const { parentMap } = storeToRefs(entityStore);
const childMap = computed(() => parentMap.value.get(parentId.value) ?? new Map<string, Entity>());

// template iteration
v-for="entity of childMap.values()"
```
