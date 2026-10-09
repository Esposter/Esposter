import { GameLanguage } from "genshin-text";

// The carried quests' words in each language, as `pnpm -C scripts genshin:text quests` writes them. Each is imported on
// Demand, so a page downloads only the language it shows
export const QuestTextLoaderMap: Record<GameLanguage, () => Promise<Readonly<Record<string, string>>>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/questText/ChineseSimplified.json")).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/questText/ChineseTraditional.json")).default,
  [GameLanguage.English]: async () => (await import("#src/generated/questText/English.json")).default,
  [GameLanguage.French]: async () => (await import("#src/generated/questText/French.json")).default,
  [GameLanguage.German]: async () => (await import("#src/generated/questText/German.json")).default,
  [GameLanguage.Indonesian]: async () => (await import("#src/generated/questText/Indonesian.json")).default,
  [GameLanguage.Italian]: async () => (await import("#src/generated/questText/Italian.json")).default,
  [GameLanguage.Japanese]: async () => (await import("#src/generated/questText/Japanese.json")).default,
  [GameLanguage.Korean]: async () => (await import("#src/generated/questText/Korean.json")).default,
  [GameLanguage.Portuguese]: async () => (await import("#src/generated/questText/Portuguese.json")).default,
  [GameLanguage.Russian]: async () => (await import("#src/generated/questText/Russian.json")).default,
  [GameLanguage.Spanish]: async () => (await import("#src/generated/questText/Spanish.json")).default,
  [GameLanguage.Thai]: async () => (await import("#src/generated/questText/Thai.json")).default,
  [GameLanguage.Turkish]: async () => (await import("#src/generated/questText/Turkish.json")).default,
  [GameLanguage.Vietnamese]: async () => (await import("#src/generated/questText/Vietnamese.json")).default,
};
