import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { checkIsWordSubset } from "#src/services/genshinAssets/kits/wiki/checkIsWordSubset";
import { toWordSet } from "#src/services/genshinAssets/kits/wiki/toWordSet";

// The rows a hit's table label finds on its talent's page, from the first of three tiers that finds any. The first
// Tier is the rows whose title words equal the label's. The second is the rows whose title words, without the title's
// Bracketed part, equal the label's, as the wiki names a variant in brackets where the table's label does not. The
// Third is the rows whose title words all appear among the label's, or that hold all of them, as the wiki names a hit
// With or without its talent's own word. A label with no words matches nothing
export const findLabelRows = (label: string, properties: readonly WikiAdvancedProperty[]): WikiAdvancedProperty[] => {
  const labelWords = toWordSet(label);
  if (labelWords.size === 0) return [];
  const checkIsSameWords = (words: ReadonlySet<string>) =>
    words.size === labelWords.size && checkIsWordSubset(words, labelWords);
  const tierMatchers = [
    (title: string) => checkIsSameWords(toWordSet(title)),
    (title: string) => checkIsSameWords(toWordSet(title.replaceAll(/\([^()]*\)/gu, ""))),
    (title: string) => {
      const words = toWordSet(title);
      return words.size > 0 && (checkIsWordSubset(words, labelWords) || checkIsWordSubset(labelWords, words));
    },
  ];
  return (
    tierMatchers.map((isMatch) => properties.filter(({ title }) => isMatch(title))).find((rows) => rows.length > 0) ??
    []
  );
};
