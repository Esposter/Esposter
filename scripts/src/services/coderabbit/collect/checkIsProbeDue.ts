import type { ProbeDueInput } from "#src/models/coderabbit/collect/ProbeDueInput";

import { PROBE_BACKOFF_MS, PROBE_COMMENT } from "#src/services/coderabbit/collect/constants";

// One retrigger per develop head, and one per rate-limit window. A rate-limited bot answers every probe with the
// Same notice, so every queue push would otherwise post another one for as long as the limit lasts — and keying
// On the head alone never expires, which deadlocks the case it was written for: the limit lifts silently, no push
// Moves develop while the window is already at the cap, and the collector waits forever on an answer that has
// Already arrived and said nothing. A probe therefore suppresses the next one only while it is both newer than
// The head and inside the backoff; past that the next event retriggers and the bot decides again.
export const checkIsProbeDue = ({ headCommittedAtMs, issueComments, nowMs, viewerLogin }: ProbeDueInput): boolean =>
  !issueComments.some(({ body, updated_at, user }) => {
    if (user.login !== viewerLogin || body.trim() !== PROBE_COMMENT) return false;
    const postedAtMs = Date.parse(updated_at);
    return postedAtMs > headCommittedAtMs && postedAtMs > nowMs - PROBE_BACKOFF_MS;
  });
