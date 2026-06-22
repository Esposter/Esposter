# Esbabbler — Voice & Video Settings

The Voice & Video panel of the [user-settings surface](user-settings.md), aligned with Discord's
Voice & Video page. Holds per-user call preferences and applies them to live LiveKit calls.

## Overview

Most settings are **DB-backed** (`userSettings` via `useUserSettingsStore`) and sync across devices.
Only the **hardware device IDs** (mic/speaker/camera) stay device-local in `localStorage`
(`store/message/user/settings/voice.ts`), since a device chosen on one machine must not apply on
another. The LiveKit store reads the DB settings and applies them through the SDK on join and on live
change (reactive watchers).

## Panel structure (top → bottom)

1. **Devices** — Microphone / Speaker selects side-by-side (`v-row` / `v-col=6`); Microphone Volume /
   Speaker Volume sliders side-by-side; Camera select; then a **Test Mic** button + segmented level
   meter (`MicTest/`).
2. **Input Profile** — radio: Voice Isolation / Studio / Custom (`noiseSuppressionMode`).
3. **Input Sensitivity** — a single gradient slider (yellow→green): the thumb is the activation
   **threshold**, a darker overlay shows the **live mic level**, and a warning + permission link
   appears when no input device is granted (`InputSensitivity/`).
4. **Input Mode** (Voice Activity / Push To Talk + keybind), **Join Settings** (mute/deafen on join)
   — existing.

## Settings & how they apply

| Setting                 | Field                             | Applied via                                                                                                          |
| ----------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Microphone Volume**   | `microphoneVolumePercentage`      | `MicrophoneProcessor` (LiveKit audio `TrackProcessor`) Web Audio `GainNode` on the local mic — supports >100% boost  |
| **Speaker Volume**      | `speakerVolumePercentage`         | master output: `HTMLMediaElement.volume` on every remote audio element (caps at 100%; >100% needs `webAudioMix`)     |
| **Input Profile**       | `noiseSuppressionMode`            | browser-native getUserMedia constraints via `getAudioCaptureDefaults` → Room `audioCaptureDefaults` + `restartTrack` |
| **Input Sensitivity**   | `inputSensitivityDecibels`        | voice-activity gate in `MicrophoneProcessor`: gain → 0 when live dB < threshold (Voice Activity mode only)           |
| **Input mode**          | `voiceInputMode`                  | `VoiceActivity` enables the sensitivity gate; `PushToTalk` is pass-through until the PTT keybind listener is built   |
| **Default mute/deafen** | `isMuteOnJoin` / `isDeafenOnJoin` | initial mic/deafen state in the join flow                                                                            |
| **Devices**             | `inputDeviceId` etc. (local)      | `room.switchActiveDevice(kind, id)` / pre-join constraints                                                           |

Device lists come from VueUse `useDevicesList`; permission is requested lazily from the Input
Sensitivity warning link.

## Input Profile (noise suppression)

Browser-native only — **no Krisp** (paid). `getAudioCaptureDefaults` maps the mode to getUserMedia
audio constraints: Voice Isolation = `echoCancellation`/`noiseSuppression`/`autoGainControl` all on;
Studio = all off (raw mic); Custom = browser defaults. A true ML denoiser would need Krisp and is out
of scope.

## Microphone processing (`MicrophoneProcessor`)

`models/message/room/call/MicrophoneProcessor.ts` is a LiveKit audio `TrackProcessor` so LiveKit owns
the lifecycle (init on publish, restart on device switch, destroy on unpublish) — no manual track
republish. It builds `source → gainNode → MediaStreamDestination`, taps the source pre-gain with an
`AnalyserNode`, and per animation frame computes the live dB level to decide the gate (gain → 0 below
threshold in Voice Activity mode) and applies `microphoneVolumePercentage / 100` as gain. The
settings panel meter uses a separate read-only `useMicrophoneLevel` composable.

> Note: there is **no** shared "speaking indicator analyser" to reuse — in-call active-speaker state
> comes from LiveKit's server-side `RoomEvent.ActiveSpeakersChanged`. Local level analysis (panel
> meter + the processor gate) is its own Web Audio graph.

## Key Files

| File                                                          | Role                                                                               |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`      | fields + `NoiseSuppressionMode` enum + check constraints                           |
| `app/store/message/user/settings/index.ts` / `voice.ts`       | DB-backed settings store / device-local IDs                                        |
| `app/components/Message/Model/User/Settings/Type/Voice/`      | the panel: `Devices/`, `Volume/`, `MicTest/`, `InputProfile/`, `InputSensitivity/` |
| `app/composables/message/user/settings/useMicrophoneLevel.ts` | read-only mic level for the panel meters                                           |
| `app/models/message/room/call/MicrophoneProcessor.ts`         | Web Audio gain + voice-activity gate (LiveKit audio TrackProcessor)                |
| `app/services/message/room/call/getAudioCaptureDefaults.ts`   | noise-suppression mode → getUserMedia constraints                                  |
| `app/store/message/room/liveKit.ts`                           | applies speaker volume, noise mode, and the mic processor to the call              |
| `app/store/message/room/call/index.ts`                        | `createRoom` passes `audioCaptureDefaults`; join flow                              |

## Not yet built

- **Push-to-talk keybind listener** — `PushToTalk` mode is currently pass-through (no gating). The
  global hold-to-talk listener (lives with the call store so it survives navigation) is future work.
- **Speaker Volume >100% boost** — needs Room `webAudioMix`; element volume caps at 100% today.
- **Per-user in-call volume slider** — the in-call right-click per-participant override (Discord has
  no panel default for this, so there is no stored setting — it is purely in-call client state).
