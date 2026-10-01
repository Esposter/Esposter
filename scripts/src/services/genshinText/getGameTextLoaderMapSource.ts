import { GameLanguage, GameLanguages } from "genshin-text";

// The loader map's source: English imported once and bundled, as the text every other language shows until its own
// Chunk arrives, and every other language a dynamic import of a chunk of its own, so a page downloads only the
// Language it shows
export const getGameTextLoaderMapSource = (): string => {
  const entries = GameLanguages.map((language) =>
    language === GameLanguage.English
      ? `  [GameLanguage.English]: () => Promise.resolve(ENGLISH_GAME_TEXT),\n`
      : `  [GameLanguage.${language}]: async () =>\n    (await import("#src/generated/text/${language}.json", { with: { type: "json" } })).default,\n`,
  );
  return `import type { GameText } from "#src/models/GameText";

import English from "#src/generated/text/English.json" with { type: "json" };
import { GameLanguage } from "#src/models/GameLanguage";

// Written by \`pnpm -C scripts genshin:text write\`, never by hand. Every language but English is a dynamic import
// On purpose: the map is the entry every reader loads, so the import is the split that keeps the fourteen languages
// A page does not show out of its eager graph
export const ENGLISH_GAME_TEXT: GameText = English;
export const GameTextLoaderMap: Record<GameLanguage, () => Promise<GameText>> = {
${entries.join("")}};
`;
};
