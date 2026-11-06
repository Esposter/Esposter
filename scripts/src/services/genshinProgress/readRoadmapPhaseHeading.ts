import { MAX_GENSHIN_PHASE } from "#src/services/fleet/constants";

// A phase heading names its phase, a number no later than the last Genshin phase, and the phase's name. Any other level-two
// Heading ends the phase, so a checkbox under no phase heading is an item of no phase
const PHASE_HEADING_REGEX = new RegExp(`^## Phase (?<phase>[0-${MAX_GENSHIN_PHASE}]): (?<name>.+)$`, "u");

// The phase and the name a roadmap line's phase heading holds, or undefined for any other line
export const readRoadmapPhaseHeading = (line: string): undefined | { name: string; phase: number } => {
  const groups = PHASE_HEADING_REGEX.exec(line)?.groups;
  return groups === undefined ? undefined : { name: groups.name ?? "", phase: Number(groups.phase) };
};
