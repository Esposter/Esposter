import type { HeldCallKnocker } from "#src/models/message/room/call/HeldCallKnocker";
import type { HeldCallParticipant } from "#src/models/message/room/call/HeldCallParticipant";

import { createTable } from "#src/services/shared/overlay/createTable";
import { knockers, participants } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

// The call participants the overlay holds, one row per connection, keyed by the id its join minted. The row is the
// Object's projected to the wire columns, since the object's row names the auth session, which no frame carries.
// It is held beside the call it is in
export const participantTable = createTable<typeof participants, HeldCallParticipant>(participants);
// The knockers the overlay holds, one row per knock, keyed by the id the knock minted.
// A let-in or a dismissal leaves a tombstone
export const knockerTable = createTable<typeof knockers, HeldCallKnocker>(knockers);
// Client-only per-remote-participant volume multiplier — no stored default, dies with the call.
export const DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE = 100;
// The frame every call video is sized to: what a screen share captures at, and what a virtual background is
// Rasterized to so it covers the frame without being scaled up
export const FULL_HD_RESOLUTION = { height: 1080, width: 1920 } as const;
// Presentation-quality capture: full HD, at a frame rate that keeps slides and code legible without saturating
// The uplink, and never offering the tab doing the sharing as a surface to share
export const SCREEN_SHARE_CONSTRAINTS = {
  frameRate: { ideal: 15, max: 15 },
  height: { max: FULL_HD_RESOLUTION.height },
  selfBrowserSurface: "exclude",
  width: { max: FULL_HD_RESOLUTION.width },
} as const;
// The popped-out call window's initial size — a compact tile that fits a video and the control bar, which the
// User resizes from there
export const PICTURE_IN_PICTURE_WINDOW_OPTIONS = { height: 320, width: 420 } as const;
// The name the microphone gate is registered under in its AudioWorklet, which the page and the worklet both name
export const MICROPHONE_GATE_PROCESSOR_NAME = "microphone-gate";
// The address the gate's worklet module is served from, which the audio middleware adds to each new context
export const MICROPHONE_GATE_URL = takeOne(
  Object.values(
    import.meta.glob<string>("#src/workers/message/room/call/microphoneGate.worklet", {
      eager: true,
      import: "default",
      query: "?worker&url",
    }),
  ),
);
