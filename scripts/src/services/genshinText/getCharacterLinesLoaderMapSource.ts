import { GameLanguages } from "genshin-text";

// The persona's loader map for the lines the game-data package does not carry yet: a chunk per language, imported
// When a spinner in that language is read and never before
export const getCharacterLinesLoaderMapSource = (): string => {
  const entries = GameLanguages.map(
    (language) =>
      `  [GameLanguage.${language}]: async () =>
    (await import("#src/generated/characterLines/${language}.json", { with: { type: "json" } })).default,
`,
  );
  return `import type { VoiceLine } from "#src/models/VoiceLine";

import { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";

// Written by \`pnpm -C scripts genshin:text write\`, never by hand. Each language is a dynamic import on purpose: the
// Map is the entry every spinner read loads, so the import is the split that keeps the other fourteen languages'
// Lines, hundreds of kilobytes each, out of it
export const CharacterLinesLoaderMap: Record<GameLanguage, () => Promise<Record<string, VoiceLine[]>>> = {
${entries.join("")}};
`;
};
