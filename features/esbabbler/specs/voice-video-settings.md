# Esbabbler — Voice & Video Settings

The Voice & Video panel of the [user-settings surface](user-settings.md). Holds the per-device call preferences Discord keeps under User Settings → Voice & Video, including push-to-talk.

## Overview

Most settings here are **DB-backed** (`userSettings` via `useUserSettingsStore`) and sync across devices — input mode, PTT keybind, sensitivity, default mute/deafen, default volume. Only the **hardware device IDs** (mic/speaker/camera) stay device-local in `localStorage` (`store/message/user/settings/voice.ts`), since a device chosen on one machine must not apply on another. The call store reads both on join and applies them through the LiveKit SDK.

## Settings

| Setting                           | Type                             | Applied via                                                                                                                     |
| --------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Input mode**                    | `Voice Activity \| Push To Talk` | gates the local mic track in the call store                                                                                     |
| **Push-to-talk keybind**          | captured key combo               | global keydown/keyup hold → unmute while held, mute on release                                                                  |
| **Input sensitivity**             | threshold (dB) + live meter      | AudioContext analyser — reuse the speaking-indicator analysis that already drives `speakingIds`                                 |
| **Input device**                  | `deviceId`                       | `room.switchActiveDevice("audioinput", id)` / pre-join constraints                                                              |
| **Output device**                 | `deviceId`                       | `room.switchActiveDevice("audiooutput", id)`                                                                                    |
| **Camera device**                 | `deviceId`                       | `room.switchActiveDevice("videoinput", id)`                                                                                     |
| **Default mute / deafen on join** | booleans                         | initial mic/deafen state in the call store join flow                                                                            |
| **Per-user volume default**       | 0–200%                           | default `RemoteParticipant.setVolume` applied to each new participant; the in-call right-click slider overrides per participant |

Device lists come from `navigator.mediaDevices.enumerateDevices()`; re-enumerate on the `devicechange` event.

## Push-to-Talk

- **Default off** (input mode = Voice Activity), matching Discord.
- When on, the call store holds the LiveKit mic track muted and unmutes only while the keybind is held — pure client mic gating, no backend, no new tRPC.
- The keybind is a global listener active whenever the user is connected to a call; it must not fire while typing in the message composer or any input.
- Pre-join (`Call/PreJoin/Index.vue`) and the active-call control bar both reflect PTT state so the mic indicator is honest.

## Key Files

| File                                                              | Role                                                                                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `app/store/message/user/settings/index.ts`                        | DB-backed voice prefs (input mode, keybind, sensitivity, default mute/deafen, volume default) via `userSettings` |
| `app/store/message/user/settings/voice.ts`                        | device-local store: mic/speaker/camera IDs in `localStorage`                                                     |
| `app/components/Message/Model/User/Settings/Type/Voice/Index.vue` | the panel UI: device selects, sensitivity slider, input-mode + keybind capture, default toggles                  |
| `app/store/message/room/call/index.ts`                            | reads `voice.ts` on join; applies devices, default mute/deafen, PTT gating                                       |
| `app/store/message/room/call/media.ts`                            | holds the live mic/deafen state the PTT keybind toggles                                                          |

## Constraints / Notes

- **Reuse, don't rebuild, the analyser.** The speaking indicator already runs AudioContext analysis; the sensitivity meter taps the same path rather than opening a second audio graph.
- **Keybind capture lives in the panel**, but the hold-to-talk listener lives with the call store so it stays active across navigation (calls already survive route changes — see [call.md](call.md)).
- The **in-call per-user volume slider** (right-click → User Volume) is a separate roadmap item; this panel only sets the _default_ it starts from. Both call `RemoteParticipant.setVolume`.
