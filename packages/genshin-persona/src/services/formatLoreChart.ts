import type { Character } from "#src/models/Character";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";
import type { ChoiceResponse } from "@typesafe-ai/sdk";

import { LORE_CHART_GLYPH, LORE_CHART_ROWS, LORE_CHART_WIDTH } from "#src/services/constants";
import { findCharacterByName } from "#src/services/findCharacterByName";

// The tier's answer as the welcome shows it: the choice first, then the runners-up by probability, one row each of
// A bar, the probability and the name — the bar and the percentage padded to one column each and the name last,
// So the rows align whatever width the interface language's script draws a name at. The bars are scaled to the
// Longest of the rows shown, since a distribution over the whole roster is thin everywhere and the shape between
// The few that matter is the picture
export const formatLoreChart = (
  { choice, probabilities }: ChoiceResponse,
  roster: Character[],
  { locale, strings }: ResolvedLocalization,
): string => {
  const runnersUp = Object.keys(probabilities)
    .filter((name) => name !== choice)
    .map((name): [string, number] => [name, probabilities[name] ?? 0])
    .toSorted(([, a], [, b]) => b - a);
  const chosenRow: [string, number] = [choice, probabilities[choice] ?? 0];
  const rows = [chosenRow, ...runnersUp].slice(0, LORE_CHART_ROWS);
  const scale = LORE_CHART_WIDTH / Math.max(...rows.map(([, probability]) => probability));
  const percentFormat = new Intl.NumberFormat(locale, { style: "percent" });
  const percents = rows.map(([, probability]) => percentFormat.format(probability));
  const percentWidth = Math.max(...percents.map(({ length }) => length));
  return [
    strings.lorePicked,
    ...rows.map(([name, probability], index) =>
      [
        LORE_CHART_GLYPH.repeat(Math.ceil(probability * scale)).padEnd(LORE_CHART_WIDTH),
        percents[index]?.padStart(percentWidth),
        findCharacterByName(roster, name)?.displayName ?? name,
      ].join(" "),
    ),
  ].join("\n");
};
