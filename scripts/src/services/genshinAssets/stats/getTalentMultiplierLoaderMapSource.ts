// The loader map's source: each character's multipliers its entry of the hosted `talentMultipliers` index, so the world
// Fetches a character's multipliers only once that character joins the party
export const getTalentMultiplierLoaderMapSource = (characterIds: readonly number[]): string => {
  const entries = characterIds.map((characterId) => `  ${characterId}: readTalentMultiplierEntry("${characterId}"),\n`);
  return `import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";

import { talentMultiplierMapSchema } from "#src/models/character/TalentMultiplierMap";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";

const readTalentMultiplierEntry =
  (characterId: string) =>
  (gameDataBaseUrl: string): Promise<TalentMultiplierMap> =>
    readGameDataEntry(gameDataBaseUrl, "talentMultipliers", characterId, talentMultiplierMapSchema);
// Written by \`pnpm -C scripts genshin:assets stats\`, never by hand. Each character's multipliers are its entry of the
// Hosted \`talentMultipliers\` index, fetched only once that character joins the party
export const TalentMultiplierLoaderMap: Readonly<
  Record<number, (gameDataBaseUrl: string) => Promise<TalentMultiplierMap>>
> = {
${entries.join("")}};
`;
};
