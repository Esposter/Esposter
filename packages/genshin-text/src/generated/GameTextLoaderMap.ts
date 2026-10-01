import type { GameText } from "#src/models/GameText";

import English from "#src/generated/text/English.json" with { type: "json" };
import { GameLanguage } from "#src/models/GameLanguage";

// Written by `pnpm -C scripts genshin:text write`, never by hand. Every language but English is a dynamic import
// On purpose: the map is the entry every reader loads, so the import is the split that keeps the fourteen languages
// A page does not show out of its eager graph
export const ENGLISH_GAME_TEXT: GameText = English;
export const GameTextLoaderMap: Record<GameLanguage, () => Promise<GameText>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/text/ChineseSimplified.json", { with: { type: "json" } })).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/text/ChineseTraditional.json", { with: { type: "json" } })).default,
  [GameLanguage.English]: () => Promise.resolve(ENGLISH_GAME_TEXT),
  [GameLanguage.French]: async () =>
    (await import("#src/generated/text/French.json", { with: { type: "json" } })).default,
  [GameLanguage.German]: async () =>
    (await import("#src/generated/text/German.json", { with: { type: "json" } })).default,
  [GameLanguage.Indonesian]: async () =>
    (await import("#src/generated/text/Indonesian.json", { with: { type: "json" } })).default,
  [GameLanguage.Italian]: async () =>
    (await import("#src/generated/text/Italian.json", { with: { type: "json" } })).default,
  [GameLanguage.Japanese]: async () =>
    (await import("#src/generated/text/Japanese.json", { with: { type: "json" } })).default,
  [GameLanguage.Korean]: async () =>
    (await import("#src/generated/text/Korean.json", { with: { type: "json" } })).default,
  [GameLanguage.Portuguese]: async () =>
    (await import("#src/generated/text/Portuguese.json", { with: { type: "json" } })).default,
  [GameLanguage.Russian]: async () =>
    (await import("#src/generated/text/Russian.json", { with: { type: "json" } })).default,
  [GameLanguage.Spanish]: async () =>
    (await import("#src/generated/text/Spanish.json", { with: { type: "json" } })).default,
  [GameLanguage.Thai]: async () =>
    (await import("#src/generated/text/Thai.json", { with: { type: "json" } })).default,
  [GameLanguage.Turkish]: async () =>
    (await import("#src/generated/text/Turkish.json", { with: { type: "json" } })).default,
  [GameLanguage.Vietnamese]: async () =>
    (await import("#src/generated/text/Vietnamese.json", { with: { type: "json" } })).default,
};
