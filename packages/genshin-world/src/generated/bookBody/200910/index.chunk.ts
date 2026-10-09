import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200910/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200910/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200910/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200910/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200910/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200910/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200910/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200910/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200910/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200910/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200910/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200910/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200910/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200910/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200910/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
