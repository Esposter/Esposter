# Esbabbler — Community Events

Discord-style scheduled room events: members RSVP, optional reminders via the scheduled-job worker, optional link to a call session.

## Data Model

Postgres table `roomEventsInMessage`:

| Field           | Notes                                                |
| --------------- | ---------------------------------------------------- |
| `id`            | UUID primary key                                     |
| `roomId`        | owning room                                          |
| `userId`        | creator                                              |
| `title`         | normalized string                                    |
| `description`   | nullable text                                        |
| `startsAt`      | timestamp                                            |
| `endsAt`        | nullable timestamp                                   |
| `callSessionId` | nullable; pre-created standalone or room call target |
| `cancelledAt`   | nullable                                             |

Postgres table `roomEventResponsesInMessage`:

| Field      | Notes                             |
| ---------- | --------------------------------- |
| `eventId`  | FK                                |
| `userId`   | FK                                |
| `response` | `Interested`, `Going`, `NotGoing` |

## API & Permissions

- Add `RoomPermission.ManageEvents` before `Administrator`; the migration must shift the Administrator bit and update stored role values.
- `roomEvent.createRoomEvent`, `updateRoomEvent`, `deleteRoomEvent` — behind `ManageEvents`.
- `roomEvent.readRoomEvents({ roomId })` — members.
- `roomEvent.updateRoomEventResponse({ eventId, response })` — members.
- Optional reminders use the scheduled-job worker — see [scheduled-messages.md](scheduled-messages.md).

## Client UX

- Event pill in the room header when an event is upcoming.
- Events tab in room settings for management.
- Event list drawer from the header action buttons.
- "Join Call" appears when the event is live and linked to a call session.

## Notes

If [Stage mode](../deferred/stage-mode.md) ships, add `RoomPermission.SpeakInStage` in the same permission-bitfield migration as `ManageEvents` so the bitfield is migrated only once.
