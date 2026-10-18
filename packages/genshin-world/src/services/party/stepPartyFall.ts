import type { Party } from "#src/models/party/Party";

import { runDownSeconds } from "#src/services/runDownSeconds";

// Runs the fall of the member on the field down by the step's seconds, none below zero
export const stepPartyFall = (party: Party, stepSeconds: number): void => {
  if (party.fallSecondsRemaining > 0)
    party.fallSecondsRemaining = Math.max(0, runDownSeconds(party.fallSecondsRemaining, stepSeconds));
};
