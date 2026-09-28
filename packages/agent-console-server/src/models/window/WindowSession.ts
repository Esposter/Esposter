import type { SessionSummary } from "#src/models/session/SessionSummary";
import type { SessionChild } from "#src/models/window/SessionChild";

// An open session, held by the window it runs in. Its title stays empty: the window's own driver reads the title, and
// The host lists it from the transcript on disk
export interface WindowSession extends Pick<SessionSummary, "cwd" | "lastActivityAt" | "state" | "title"> {
  child: SessionChild;
}
