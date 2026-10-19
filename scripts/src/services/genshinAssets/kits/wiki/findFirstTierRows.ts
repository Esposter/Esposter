import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

// The rows of the first tier that finds any, where each tier is a matcher on a row's title, tried in order. No tier
// Finding any gives no row
export const findFirstTierRows = (
  properties: readonly WikiAdvancedProperty[],
  tierMatchers: readonly ((title: string) => boolean)[],
): WikiAdvancedProperty[] =>
  tierMatchers.map((isMatch) => properties.filter(({ title }) => isMatch(title))).find((rows) => rows.length > 0) ?? [];
