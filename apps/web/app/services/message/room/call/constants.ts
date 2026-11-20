import type { HeldCallParticipant } from "#src/models/message/room/call/HeldCallParticipant";
import type { Table } from "#src/models/shared/overlay/Table";

import { participants } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { getTableName } from "drizzle-orm";

// The call participants the overlay holds, one row per connection, keyed by the id its join minted. The table is not a createTable
// Over the object: the object's row names the auth session, which no frame carries, so the row the overlay holds is the wire row
// Beside the call it is in, and its key is the id the call names the connection by
export const participantTable: Table<HeldCallParticipant, typeof participants> = {
  keyOf: (participant) => [participant.id],
  name: getTableName(participants),
  source: participants,
};
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
