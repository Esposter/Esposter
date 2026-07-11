---
title: Push-to-talk keybind
description: Proposal — global hold-to-talk listener making PushToTalk mode functional.
---

# Push-to-Talk Keybind Listener

Make `VoiceInputMode.PushToTalk` real: while the configured key is held, the mic transmits; released, it gates to silence. Today the mode is stored but pass-through ([/docs/esbabbler/voice-video](/docs/esbabbler/voice-video) → Not yet built).

## Scope

**Today:** `userSettingsInMessage.voiceInputMode` and `pushToTalkKeybind` exist; the Keybinds panel shows them; `MicrophoneProcessor` gates on voice activity only.

**This adds:** a global keydown/keyup listener that drives the existing gate. No schema or procedure changes — purely wiring stored settings to the audio graph.

## How it works

- A `usePushToTalk` composable **living with the call store** (so it survives navigation, like the call itself) registers `keydown`/`keyup` window listeners while `isInCall && voiceInputMode === PushToTalk`.
- Key match against `pushToTalkKeybind` (a serialized key combo; reuse the existing keybind display format). Held → `MicrophoneProcessor` gate open; released → gate closed (gain → 0). The processor already exposes the gate for voice activity — PTT sets the same gate from key state instead of dB level.
- Keybind **capture UI**: the Keybinds settings panel field enters "recording" mode on click and stores the next combo (`updateUserSettings`).
- Listeners skip when focus is in an editable element (composer) unless the combo includes a modifier — Discord behaviour.
- The PiP window needs its own listeners (`pipWindow` document) — key events don't cross documents; `Pip/Host` wires them when open.

## Key files

| File                                                                     | Change                      |
| :----------------------------------------------------------------------- | :-------------------------- |
| `packages/app/app/composables/message/room/call/usePushToTalk.ts`        | new listener composable     |
| `packages/app/app/models/message/room/call/MicrophoneProcessor.ts`       | expose key-driven gate mode |
| `packages/app/app/components/Message/Model/User/Settings/Type/Keybinds/` | recording field             |

## Notes

Browser limitation: keys only arrive while an app window (main or PiP) is focused — true global OS-level PTT needs a desktop app and is out of scope (same constraint family as [currently-playing activity](/docs/esbabbler/rejected/currently-playing-activity)). The PiP window being focusable mitigates this for the presenting case.
