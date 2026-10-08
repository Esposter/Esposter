import { GameLanguage } from "genshin-text";

// The names the stat tables cite by text id, the characters' and the weapons', in each language, as
// `pnpm -C scripts genshin:text names` writes them. Each is imported on demand, so a page downloads only the language it
// Shows and none of them with the package
export const NameTextLoaderMap: Record<GameLanguage, () => Promise<Readonly<Record<string, string>>>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/nameText/ChineseSimplified.json")).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/nameText/ChineseTraditional.json")).default,
  [GameLanguage.English]: async () => (await import("#src/generated/nameText/English.json")).default,
  [GameLanguage.French]: async () => (await import("#src/generated/nameText/French.json")).default,
  [GameLanguage.German]: async () => (await import("#src/generated/nameText/German.json")).default,
  [GameLanguage.Indonesian]: async () => (await import("#src/generated/nameText/Indonesian.json")).default,
  [GameLanguage.Italian]: async () => (await import("#src/generated/nameText/Italian.json")).default,
  [GameLanguage.Japanese]: async () => (await import("#src/generated/nameText/Japanese.json")).default,
  [GameLanguage.Korean]: async () => (await import("#src/generated/nameText/Korean.json")).default,
  [GameLanguage.Portuguese]: async () => (await import("#src/generated/nameText/Portuguese.json")).default,
  [GameLanguage.Russian]: async () => (await import("#src/generated/nameText/Russian.json")).default,
  [GameLanguage.Spanish]: async () => (await import("#src/generated/nameText/Spanish.json")).default,
  [GameLanguage.Thai]: async () => (await import("#src/generated/nameText/Thai.json")).default,
  [GameLanguage.Turkish]: async () => (await import("#src/generated/nameText/Turkish.json")).default,
  [GameLanguage.Vietnamese]: async () => (await import("#src/generated/nameText/Vietnamese.json")).default,
};
