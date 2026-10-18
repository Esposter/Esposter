export interface StormterrorFight {
  phase: number;
  phaseElapsedSeconds: number;
  // The shield breaks across the whole fight, which is how a phase's shield limit counts them
  totalShieldBreaks: number;
}
