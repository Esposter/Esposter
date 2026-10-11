import { GameDataset } from "genshin-world";

// The loader map's source: each character's icons its entry of the hosted `skillGlyphs` index, so the world fetches a
// Character's icons only once that character joins the party, and a character the index lacks has no loader
export const getSkillGlyphsLoaderMapSource = (characterIds: readonly number[]): string => {
  const entries = characterIds.map((characterId) => `  ${characterId}: readSkillGlyphsEntry("${characterId}"),\n`);
  return `import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";

import { skillGlyphsSchema } from "#src/models/hud/SkillGlyphs";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";

const readSkillGlyphsEntry =
  (characterId: string) =>
  (gameDataBaseUrl: string): Promise<SkillGlyphs> =>
    readGameDataEntry(gameDataBaseUrl, "${GameDataset.SkillGlyphs}", characterId, skillGlyphsSchema);
// Written by \`pnpm -C scripts genshin:assets skill-glyphs\`, never by hand. Each character's skill and burst icons are its
// Entry of the hosted \`skillGlyphs\` index, fetched only once that character joins the party
export const SkillGlyphsLoaderMap: Readonly<Record<number, (gameDataBaseUrl: string) => Promise<SkillGlyphs>>> = {
${entries.join("")}};
`;
};
