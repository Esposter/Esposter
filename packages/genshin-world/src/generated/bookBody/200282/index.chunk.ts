import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200282/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200282/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200282/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200282/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200282/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200282/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200282/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200282/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200282/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200282/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200282/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200282/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200282/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200282/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200282/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
