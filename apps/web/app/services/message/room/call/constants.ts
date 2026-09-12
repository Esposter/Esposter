// Client-only per-remote-participant volume multiplier — no stored default, dies with the call.
export const DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE = 100;
// One upload affordance, so one stable target: the picker's tile is disabled while a write is in flight, and
// This is what it reads. Deletes are keyed per slot instead — they are independent targets, and sharing one
// Key would serialise a user working down their own list
export const CALL_BACKGROUND_UPLOAD_KEY = "callBackgroundUpload";
// Presentation-quality capture: full HD, at a frame rate that keeps slides and code legible without saturating
// The uplink, and never offering the tab doing the sharing as a surface to share
export const SCREEN_SHARE_CAPTURE_OPTIONS = {
  audio: true,
  resolution: { frameRate: 15, height: 1080, width: 1920 },
  selfBrowserSurface: "exclude",
  surfaceSwitching: "include",
} as const;
