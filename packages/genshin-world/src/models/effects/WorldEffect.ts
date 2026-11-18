import type { BaseWorldEffect } from "#src/models/effects/BaseWorldEffect";

// A world effect still showing, with the seconds of its life still to run. The step runs that down and drops the effect
// Once it runs out, so the list holds only the effects still showing
export interface WorldEffect extends BaseWorldEffect {
  // The seconds of its life still to run
  secondsRemaining: number;
}
