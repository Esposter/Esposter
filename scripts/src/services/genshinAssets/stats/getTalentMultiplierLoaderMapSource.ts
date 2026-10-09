// The loader map's source: each character's multipliers a dynamic import of a chunk of its own, so the world downloads a
// Character's multipliers only once that character joins the party
export const getTalentMultiplierLoaderMapSource = (characterIds: readonly number[]): string => {
  const entries = characterIds.map(
    (characterId) => `  ${characterId}: () => import("#src/generated/talentMultipliers/${characterId}.json"),\n`,
  );
  return `// Written by \`pnpm -C scripts genshin:assets stats\`, never by hand. Each character's chunk is a dynamic import on
// Purpose, so the world's entry never holds the multipliers of a character the party does not
export const TalentMultiplierLoaderMap: Readonly<Record<number, () => Promise<{ default: unknown }>>> = {
${entries.join("")}};
`;
};
