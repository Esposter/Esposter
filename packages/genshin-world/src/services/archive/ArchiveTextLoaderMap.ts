import { GameLanguage } from "genshin-text";

// The Archive's entry names by text id, in each language, as `pnpm -C scripts genshin:assets archive` writes them. Each is
// Imported on demand, so a page downloads only the language it shows
export const ArchiveTextLoaderMap: Record<GameLanguage, () => Promise<Readonly<Record<string, string>>>> = {
  [GameLanguage.ChineseSimplified]: async () =>
    (await import("#src/generated/archiveText/ChineseSimplified.json")).default,
  [GameLanguage.ChineseTraditional]: async () =>
    (await import("#src/generated/archiveText/ChineseTraditional.json")).default,
  [GameLanguage.English]: async () => (await import("#src/generated/archiveText/English.json")).default,
  [GameLanguage.French]: async () => (await import("#src/generated/archiveText/French.json")).default,
  [GameLanguage.German]: async () => (await import("#src/generated/archiveText/German.json")).default,
  [GameLanguage.Indonesian]: async () => (await import("#src/generated/archiveText/Indonesian.json")).default,
  [GameLanguage.Italian]: async () => (await import("#src/generated/archiveText/Italian.json")).default,
  [GameLanguage.Japanese]: async () => (await import("#src/generated/archiveText/Japanese.json")).default,
  [GameLanguage.Korean]: async () => (await import("#src/generated/archiveText/Korean.json")).default,
  [GameLanguage.Portuguese]: async () => (await import("#src/generated/archiveText/Portuguese.json")).default,
  [GameLanguage.Russian]: async () => (await import("#src/generated/archiveText/Russian.json")).default,
  [GameLanguage.Spanish]: async () => (await import("#src/generated/archiveText/Spanish.json")).default,
  [GameLanguage.Thai]: async () => (await import("#src/generated/archiveText/Thai.json")).default,
  [GameLanguage.Turkish]: async () => (await import("#src/generated/archiveText/Turkish.json")).default,
  [GameLanguage.Vietnamese]: async () => (await import("#src/generated/archiveText/Vietnamese.json")).default,
};
