import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The shortcuts dialog and the command palette list every whiteboard command under this group
export const WHITEBOARD_COMMAND_GROUP = "Whiteboard";
// How far one arrow key nudges the selection in document units, and how far it nudges with Shift
export const WHITEBOARD_NUDGE_STEP = 1;
export const WHITEBOARD_NUDGE_LARGE_STEP = 10;
// The unit direction each arrow key nudges a selection in, and the mark its commands wear
export const WHITEBOARD_NUDGE_DIRECTIONS = {
  ArrowDown: { direction: "down", meaning: UiIconMeaning.ArrowDown, point: { x: 0, y: 1 } },
  ArrowLeft: { direction: "left", meaning: UiIconMeaning.ArrowLeft, point: { x: -1, y: 0 } },
  ArrowRight: { direction: "right", meaning: UiIconMeaning.ArrowRight, point: { x: 1, y: 0 } },
  ArrowUp: { direction: "up", meaning: UiIconMeaning.ArrowUp, point: { x: 0, y: -1 } },
} as const;
