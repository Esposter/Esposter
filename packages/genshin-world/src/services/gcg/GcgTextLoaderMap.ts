import { GameLanguage } from "genshin-text";

// The card game's names and descriptions by text id, in each language, as `pnpm -C scripts genshin:text gcg` writes them.
// Each is imported on demand, so a duel downloads only the language it shows
export const GcgTextLoaderMap: Record<GameLanguage, () => Promise<Readonly<Record<string, string>>>> = {
  [GameLanguage.ChineseSimplified]: async () => (await import("#src/generated/gcgText/ChineseSimplified.json")).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/gcgText/ChineseTraditional.json")).default,
  [GameLanguage.English]: async () => (await import("#src/generated/gcgText/English.json")).default,
  [GameLanguage.French]: async () => (await import("#src/generated/gcgText/French.json")).default,
  [GameLanguage.German]: async () => (await import("#src/generated/gcgText/German.json")).default,
  [GameLanguage.Indonesian]: async () => (await import("#src/generated/gcgText/Indonesian.json")).default,
  [GameLanguage.Italian]: async () => (await import("#src/generated/gcgText/Italian.json")).default,
  [GameLanguage.Japanese]: async () => (await import("#src/generated/gcgText/Japanese.json")).default,
  [GameLanguage.Korean]: async () => (await import("#src/generated/gcgText/Korean.json")).default,
  [GameLanguage.Portuguese]: async () => (await import("#src/generated/gcgText/Portuguese.json")).default,
  [GameLanguage.Russian]: async () => (await import("#src/generated/gcgText/Russian.json")).default,
  [GameLanguage.Spanish]: async () => (await import("#src/generated/gcgText/Spanish.json")).default,
  [GameLanguage.Thai]: async () => (await import("#src/generated/gcgText/Thai.json")).default,
  [GameLanguage.Turkish]: async () => (await import("#src/generated/gcgText/Turkish.json")).default,
  [GameLanguage.Vietnamese]: async () => (await import("#src/generated/gcgText/Vietnamese.json")).default,
};
