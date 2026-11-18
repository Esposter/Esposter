import type { PerpetualMechanicalArrayMode } from "#src/models/bosses/PerpetualMechanicalArrayMode";

export interface PerpetualMechanicalArrayFight {
  // The seconds since the fight began, which its first timed Defensive Mode activation counts
  fightSeconds: number;
  // Whether Defensive Mode has been triggered, which happens once a fight, and lifts the health gate for good
  isDefensiveModeTriggered: boolean;
  mode: PerpetualMechanicalArrayMode;
  // The seconds spent in the current mode
  modeSeconds: number;
}
