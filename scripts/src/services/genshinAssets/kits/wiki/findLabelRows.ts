import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { checkIsWordSubset } from "#src/services/genshinAssets/kits/wiki/checkIsWordSubset";
import { findFirstTierRows } from "#src/services/genshinAssets/kits/wiki/findFirstTierRows";
import { readHitNumber } from "#src/services/genshinAssets/kits/wiki/readHitNumber";
import { toExactTitle } from "#src/services/genshinAssets/kits/wiki/toExactTitle";
import { toWordSet } from "#src/services/genshinAssets/kits/wiki/toWordSet";

// A place after a label in a row's title, one whole number or one letter, as in `4-Hit DMG 1` or `4-Hit DMG B`
const PLACE_TOKEN_REGEX = /^(?:\d+|[a-z])$/u;
// The rows a hit's table label finds on its talent's page, from the first of four tiers that finds any. The first tier
// Is the rows whose title equals the label exactly, case and whitespace runs aside, or equals it followed by a place,
// Like `4-Hit DMG 1` for `4-Hit DMG`, since the wiki's title often shares the label's words, its hit numbers included,
// Which the word tiers drop: `Skill 1-Hit DMG` and `Skill 2-Hit DMG` both read `skill`. The second is the rows
// Whose title words equal the label's. The third is the rows whose title words, without the title's bracketed part,
// Equal the label's, as the wiki names a variant in brackets the table's label does not. The fourth is the rows whose
// Title words all appear among the label's, or that hold all of them, as the wiki names a hit with or without its
// Talent's own word. A label with no words has no word tier, so only the first tier finds a row
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
  const checkIsExactLabel = (title: string) => {
    const exactTitle = toExactTitle(title);
    return (
      exactTitle === exactLabel ||
      (exactTitle.startsWith(`${exactLabel} `) && PLACE_TOKEN_REGEX.test(exactTitle.slice(exactLabel.length + 1)))
    );
  };
  return findFirstTierRows(numberedRows, [checkIsExactLabel, ...wordTiers]);
};
