import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { checkIsWordSubset } from "#src/services/genshinAssets/kits/wiki/checkIsWordSubset";
import { findFirstTierRows } from "#src/services/genshinAssets/kits/wiki/findFirstTierRows";
import { readHitNumber } from "#src/services/genshinAssets/kits/wiki/readHitNumber";
import { toExactTitle } from "#src/services/genshinAssets/kits/wiki/toExactTitle";
import { toWordSet } from "#src/services/genshinAssets/kits/wiki/toWordSet";

// The rows a hit's table label finds on its talent's page, from the first of four tiers that finds any. The first tier
// Is the rows whose title equals the label exactly, case and whitespace runs aside, since the wiki's title often shares
// The label's words, its hit numbers included, which the word tiers drop: `Skill 1-Hit DMG` and `Skill 2-Hit DMG` both
// Read `skill`. The second is the rows whose title words equal the label's. The third is the rows whose title words,
// Without the title's bracketed part, equal the label's, as the wiki names a variant in brackets the table's label does
// Not. The fourth is the rows whose title words all appear among the label's, or that hold all of them, as the
// Wiki names a hit with or without its talent's own word. A label with no words has no word tier, so only its exact
// Title finds a row
export const findLabelRows = (label: string, properties: readonly WikiAdvancedProperty[]): WikiAdvancedProperty[] => {
  const exactLabel = toExactTitle(label);
  const labelWords = toWordSet(label);
  const labelNumber = readHitNumber(label);
  // The word tiers drop a hit's number to compare its words, so a numbered label keeps only the rows of its own number,
  // Or of none
  const numberedRows = properties.filter(({ title }) => {
    const rowNumber = readHitNumber(title);
    return labelNumber === undefined || rowNumber === undefined || rowNumber === labelNumber;
  });
  const checkIsSameWords = (words: ReadonlySet<string>) =>
    words.size === labelWords.size && checkIsWordSubset(words, labelWords);
  const wordTiers: readonly ((title: string) => boolean)[] =
    labelWords.size === 0
      ? []
      : [
          (title) => checkIsSameWords(toWordSet(title)),
          (title) => checkIsSameWords(toWordSet(title.replaceAll(/\([^()]*\)/gu, ""))),
          (title) => {
            const words = toWordSet(title);
            return words.size > 0 && (checkIsWordSubset(words, labelWords) || checkIsWordSubset(labelWords, words));
          },
        ];
  return findFirstTierRows(numberedRows, [(title) => toExactTitle(title) === exactLabel, ...wordTiers]);
};
