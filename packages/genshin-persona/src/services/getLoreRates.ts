import type { Character } from "#src/models/Character";
import type { LoreRate } from "#src/models/LoreRate";
import type { ChoiceResponse } from "@typesafe-ai/sdk";

import { LORE_CHART_ROWS } from "#src/services/constants";
import { findCharacterByName } from "#src/services/findCharacterByName";

// The rows the welcome's chart shows: the tier's choice first, then the runners-up by probability, at most the chart's
// Rows. The welcome draws them and the session-start context carries them, so a theme shows the same odds the person reads
export const getLoreRates = ({ choice, probabilities }: ChoiceResponse, roster: Character[]): LoreRate[] => {
  const runnersUp = Object.keys(probabilities)
    .filter((name) => name !== choice)
    .map((name) => ({ name, probability: probabilities[name] ?? 0 }))
    .toSorted(
      ({ probability: firstProbability }, { probability: secondProbability }) => secondProbability - firstProbability,
    );
  return [{ name: choice, probability: probabilities[choice] ?? 0 }, ...runnersUp]
    .slice(0, LORE_CHART_ROWS)
    .map(({ name, probability }) => ({
      displayName: findCharacterByName(roster, name)?.displayName ?? name,
      name,
      probability,
    }));
};
