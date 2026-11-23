import { RightDrawer } from "#src/models/message/RightDrawer";

// Consecutive messages from the same author within this window render as one batch — one avatar, one header
export const SAME_BATCH_WINDOW_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The soonest a message may be scheduled for, and therefore also what a picker opens on: a job the user
// Confirms without touching the picker still runs in the future.
export const SCHEDULE_LEAD_TIME_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// How long the message a jump lands on stays highlighted before the highlight clears
export const ACTIVE_MESSAGE_HIGHLIGHT_MS: number = Temporal.Duration.from({ seconds: 2 }).total("milliseconds");
// How long a typist stays listed after their last typing frame
export const TYPING_WINDOW_MS = Temporal.Duration.from({ seconds: 3 }).total("milliseconds");
// The name an author nobody can resolve is drawn under, so the message they wrote is still shown rather than dropped
export const UNKNOWN_USER_NAME = "Unknown user";
// The identity an author nobody can resolve is drawn with, before the id the message names is put on it
export const UNKNOWN_CREATOR = { image: "", name: UNKNOWN_USER_NAME };
// The panes the room header toggles, in the order its buttons and its phone menu's rows stand
export const RIGHT_DRAWER_TOGGLES = [RightDrawer.Threads, RightDrawer.Search, RightDrawer.Member] as const;
// The keys that hold a link open for a click while the editor's cursor is a pointer over it: Ctrl, and Cmd on a Mac
export const LINK_MODIFIER_KEYS = ["Control", "Meta"];
