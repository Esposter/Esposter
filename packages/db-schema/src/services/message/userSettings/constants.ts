export const MIN_INPUT_SENSITIVITY_DECIBELS = -100;
export const MAX_INPUT_SENSITIVITY_DECIBELS = 0;
export const DEFAULT_INPUT_SENSITIVITY_DECIBELS = -50;
export const MAX_USER_VOLUME_PERCENTAGE = 200;
export const DEFAULT_MICROPHONE_VOLUME_PERCENTAGE = 100;
export const DEFAULT_SPEAKER_VOLUME_PERCENTAGE = 100;
export const MIN_AUTO_IDLE_THRESHOLD_MS = 60_000;
export const MAX_AUTO_IDLE_THRESHOLD_MS = 86_400_000;
export const DEFAULT_AUTO_IDLE_THRESHOLD_MS = 600_000;
// A keybind is one `KeyboardEvent.code`, the longest of which is well inside this - the bound is what stops an
// Unbounded string being stored, not a statement about which codes are real
export const MAX_PUSH_TO_TALK_KEYBIND_LENGTH = 64;
export const MIN_PUSH_TO_TALK_RELEASE_DELAY_MS = 0;
export const MAX_PUSH_TO_TALK_RELEASE_DELAY_MS = 2000;
export const DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS = 20;
// The selection is a preset's path or a slot name, and neither is long. Nothing resolves an unknown value to
// Anything but "no background", so this bounds what a client can store rather than deciding what is valid.
export const MAX_VIRTUAL_BACKGROUND_LENGTH = 128;
