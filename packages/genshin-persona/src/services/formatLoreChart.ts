import type { LoreRate } from "#src/models/LoreRate";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { LORE_CHART_GLYPH, LORE_CHART_WIDTH } from "#src/services/constants";

// The tier's answer as the welcome shows it: one row each of a bar, the probability and the name, the bar and the
// Percentage padded to one column each and the name last, so the rows align whatever width the interface language's
// Script draws a name at. The bars are scaled to the longest of the rows shown, since a distribution over the whole
// Roster is thin everywhere and the shape between the few that matter is the picture
export const formatLoreChart = (rates: LoreRate[], { locale, strings }: ResolvedLocalization): string => {
  const scale = LORE_CHART_WIDTH / Math.max(...rates.map(({ probability }) => probability));
  const percentFormat = new Intl.NumberFormat(locale, { style: "percent" });
  const percents = rates.map(({ probability }) => percentFormat.format(probability));
  const percentWidth = Math.max(...percents.map(({ length }) => length));
  return [
    strings.lorePicked,
    ...rates.map(({ displayName, probability }, index) =>
      [
        LORE_CHART_GLYPH.repeat(Math.ceil(probability * scale)).padEnd(LORE_CHART_WIDTH),
        percents[index]?.padStart(percentWidth),
        displayName,
      ].join(" "),
    ),
  ].join("\n");
};
