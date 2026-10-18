import type { StormterrorFight } from "#src/models/bosses/StormterrorFight";
import type { StormterrorPhase } from "#src/models/bosses/StormterrorPhase";

// Whether a phase is over: its time limit has run out, or the fight's shield breaks have reached its shield limit
export const checkIsStormterrorPhaseOver = (
  { shieldLimit, timeLimitSeconds }: StormterrorPhase,
  { phaseElapsedSeconds, totalShieldBreaks }: StormterrorFight,
): boolean => phaseElapsedSeconds >= timeLimitSeconds || totalShieldBreaks >= shieldLimit;
