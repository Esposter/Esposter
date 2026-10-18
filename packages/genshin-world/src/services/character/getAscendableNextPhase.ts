import type { AscensionPhase } from "#src/models/character/AscensionPhase";

import { getNextAscensionPhase } from "#src/services/character/getNextAscensionPhase";

// The phase a character or a weapon ascends into, if it can ascend now: it sits at its current phase's level cap and a
// Next phase exists. The offer and the ascension both read it, so neither can be allowed a case the other refuses
export const getAscendableNextPhase = <TPhase extends AscensionPhase>(
  phases: TPhase[],
  ascension: number,
  level: number,
): TPhase | undefined => {
  const phase = phases[ascension];
  const nextPhase = getNextAscensionPhase(phases, ascension);
  return phase && nextPhase && level === phase.maxLevel ? nextPhase : undefined;
};
