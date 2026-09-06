# Verb Families

Read when two prefixes both look right for a function — a derivation against a fetch, a setter against a push, a
formula against an algorithm, an event handler against a resolver hook.

The prefix roster itself is in `SKILL.md`; this page separates the families that collide.

## `get*` vs `read*` vs `count*`

`get*` derives or formats a value already in hand. `read*` fetches — never `fetch*`, which is reserved for the
Web API.

A fetch that answers with a count is still a fetch: `readFoosCount`, and the service behind it takes the
procedure's name. `count*` names a pure in-memory tally (`countOccurrences`), where the verb is the whole
operation and nothing is fetched. A fetch that groups answers with rows is plural and named for them
(`readFooTagCounts`) — the `trpc` skill owns that under Procedure & Result Naming.

A thin wrapper over a dependency's own listing keeps that dependency's verb instead of either
(`references/names-a-dependency-owns.md`).

## `get*` vs `compute*`

`compute*` is the verb for a value an algorithm produces from a collection or a dataset — column statistics, a
transformation over rows, a cache key over a file tree. `get*` stays for a lookup, a format or a one-line
expression, however large the thing being looked up is.

**There is no third spelling.** `calculate*` is the same act said differently, so a formula short enough to read
at a glance is `get*` and everything longer is `compute*`.

## `set*` vs `apply*`

`set*` writes stored state; `apply*` pushes stored state onto something live. `setRemoteAudioMuted(isDeafened)`
takes the value and writes it; `applySpeakerVolume()` takes nothing, reads the settings already stored, and
pushes them onto the media elements, as `applyMicrophoneSettings` does onto the processor. **A no-argument
`set*` is the tell**: there is no value being set, so the name belongs to the other family.

`apply*` also names a pure transform returning the subject with the modifier applied — `applySkinTone(emoji,
skinTone)` returns the toned character, `applyEffects(basePower, effects)` returns the power those effects
produce. Both senses read the same way round: the modifier is applied _to_ the subject, and what comes back is
that subject after it, or the subject is mutated in place and nothing is returned. This is not the `get*` family,
which answers a question about a value it leaves alone.

## A setter is named after the field it writes

A function whose whole body assigns a boolean `is*` field is `set` plus that field's name minus the `is`:
`setParticipantMuted` writes `isMuted`, `setParticipantCameraEnabled` writes `isCameraEnabled`,
`setParticipantHandRaised` writes `isHandRaised`.

`setMute`, `setCamera` and `setHandRaisedEnabled` each name an action or invent a second word for a field that
already has one, so the setter and the thing it sets have to be matched up by reading the body. The field's own
name is the one both sides already share, and where the setter names whose field it is, that qualifier comes
first (`setParticipant*`) so the family sorts together.

## `on*` vs `handle*`

`on*` prefixes a function something else calls with an event or an input it did not initiate — a template
binding, a subscription payload, a frame loop, or a wrapper over an existing named store/service function
(`onUpdateFoo` wraps `updateFoo`). Direct actions use the action name: `submit`, `save`, `delete`, never
`onSubmit`/`onSave`/`onDelete`.

One input family takes **one** name across every store that answers it: the dungeons scene stores and the dialog
store all spell theirs `onPlayerInput`, and where a store holding its own reaches a dependency's, that one is
dot-accessed rather than renamed apart.

`handle*` is the resolver-hook prefix and nothing else — the method an abstract resolver declares for its
subclasses to override, named `handle<Subject>` (`AInputResolver.handleInput`, `AItemResolver.handleItem`,
`AChartTypeResolver.handleConfiguration`). It marks the overridable slot, which is what keeps it beside `on*`
rather than competing with it. Outside a resolver class it is a second spelling of `on*`, so a store, service or
composable never has one.

## No cardinality suffixes

Upgrading single-item → batch keeps the same name. Never add `Many` or `Batch`, and never pluralize a selector
because the batch takes several of what it selects on (`readMessagesByRoom` → `readMessagesByRooms`); `readFoo` →
`readFoos` is the case this ban is for.

**A `By<Selector>` separating two reads of the same rows is not one of these.** The ban is on a suffix that only
says "several", so the test is whether dropping it leaves two procedures that mean different things:
`readMembersByIds` beside a paginated `readMembers` names _which_ rows are being asked for rather than how many,
and dropping it collides. This is a **function's** name — the same words on a map are the `<key><value>Map` rule
in `SKILL.md`.
