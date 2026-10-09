import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { MISSING_CHECK_WAIT_MS, PENDING_CHECK_WAIT_MS } from "#src/services/coderabbit/collect/constants";
import { readCheckStartedAt } from "#src/services/coderabbit/collect/readCheckStartedAt";

// The instant the bottom window's check is given up on and its review asked for as a skipped one is: a check that
// Never appeared counts from the window's opening, and one stuck pending from the status that set it. Neither ends in
// An event — a review the bot dropped sends no status — so each wait is the collector's own. A pending start that
// Cannot be read counts from now, since an ask over a review still running cancels it. Undefined for every other
// State, which no such wait holds.
export const readCheckWaitEndsAtMs = (
  gateKind: GateDecisionKind,
  { createdAt, number }: Pick<WindowPullRequest, "createdAt" | "number">,
  nowMs: number,
): number | undefined => {
  if (gateKind === GateDecisionKind.Missing) return Date.parse(createdAt) + MISSING_CHECK_WAIT_MS;
  else if (gateKind !== GateDecisionKind.Running) return undefined;

  const startedAtMs = Date.parse(readCheckStartedAt(number));
  return (Number.isNaN(startedAtMs) ? nowMs : startedAtMs) + PENDING_CHECK_WAIT_MS;
};
