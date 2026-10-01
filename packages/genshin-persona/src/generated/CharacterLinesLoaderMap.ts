import type { VoiceLine } from "#src/models/VoiceLine";

import { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";

// Written by `pnpm -C scripts genshin:text write`, never by hand. Each language is a dynamic import on purpose: the
// Map is the entry every spinner read loads, so the import is the split that keeps the other fourteen languages'
// Lines, hundreds of kilobytes each, out of it
export const CharacterLinesLoaderMap: Record<GameLanguage, () => Promise<Record<string, VoiceLine[]>>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/characterLines/ChineseSimplified.json", { with: { type: "json" } })).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/characterLines/ChineseTraditional.json", { with: { type: "json" } })).default,
  [GameLanguage.English]: async () =>
    (await import("#src/generated/characterLines/English.json", { with: { type: "json" } })).default,
  [GameLanguage.French]: async () =>
    (await import("#src/generated/characterLines/French.json", { with: { type: "json" } })).default,
  [GameLanguage.German]: async () =>
    (await import("#src/generated/characterLines/German.json", { with: { type: "json" } })).default,
  [GameLanguage.Indonesian]: async () =>
    (await import("#src/generated/characterLines/Indonesian.json", { with: { type: "json" } })).default,
  [GameLanguage.Italian]: async () =>
    (await import("#src/generated/characterLines/Italian.json", { with: { type: "json" } })).default,
  [GameLanguage.Japanese]: async () =>
    (await import("#src/generated/characterLines/Japanese.json", { with: { type: "json" } })).default,
  [GameLanguage.Korean]: async () =>
    (await import("#src/generated/characterLines/Korean.json", { with: { type: "json" } })).default,
  [GameLanguage.Portuguese]: async () =>
    (await import("#src/generated/characterLines/Portuguese.json", { with: { type: "json" } })).default,
  [GameLanguage.Russian]: async () =>
    (await import("#src/generated/characterLines/Russian.json", { with: { type: "json" } })).default,
  [GameLanguage.Spanish]: async () =>
    (await import("#src/generated/characterLines/Spanish.json", { with: { type: "json" } })).default,
  [GameLanguage.Thai]: async () =>
    (await import("#src/generated/characterLines/Thai.json", { with: { type: "json" } })).default,
  [GameLanguage.Turkish]: async () =>
    (await import("#src/generated/characterLines/Turkish.json", { with: { type: "json" } })).default,
  [GameLanguage.Vietnamese]: async () =>
    (await import("#src/generated/characterLines/Vietnamese.json", { with: { type: "json" } })).default,
};
