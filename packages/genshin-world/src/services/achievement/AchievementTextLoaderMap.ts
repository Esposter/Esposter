import { GameLanguage } from "genshin-text";

// The achievements' and categories' titles and descriptions by text id, in each language, as `pnpm -C scripts genshin:assets
// Achievements` writes them. Each is imported on demand, so a page downloads only the language it shows
export const AchievementTextLoaderMap: Record<GameLanguage, () => Promise<Readonly<Record<string, string>>>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/achievementText/ChineseSimplified.json")).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/achievementText/ChineseTraditional.json")).default,
  [GameLanguage.English]: async () => (await import("#src/generated/achievementText/English.json")).default,
  [GameLanguage.French]: async () => (await import("#src/generated/achievementText/French.json")).default,
  [GameLanguage.German]: async () => (await import("#src/generated/achievementText/German.json")).default,
  [GameLanguage.Indonesian]: async () => (await import("#src/generated/achievementText/Indonesian.json")).default,
  [GameLanguage.Italian]: async () => (await import("#src/generated/achievementText/Italian.json")).default,
  [GameLanguage.Japanese]: async () => (await import("#src/generated/achievementText/Japanese.json")).default,
  [GameLanguage.Korean]: async () => (await import("#src/generated/achievementText/Korean.json")).default,
  [GameLanguage.Portuguese]: async () => (await import("#src/generated/achievementText/Portuguese.json")).default,
  [GameLanguage.Russian]: async () => (await import("#src/generated/achievementText/Russian.json")).default,
  [GameLanguage.Spanish]: async () => (await import("#src/generated/achievementText/Spanish.json")).default,
  [GameLanguage.Thai]: async () => (await import("#src/generated/achievementText/Thai.json")).default,
  [GameLanguage.Turkish]: async () => (await import("#src/generated/achievementText/Turkish.json")).default,
  [GameLanguage.Vietnamese]: async () => (await import("#src/generated/achievementText/Vietnamese.json")).default,
};
