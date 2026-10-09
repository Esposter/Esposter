import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200185/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200185/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200185/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200185/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200185/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200185/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200185/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200185/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200185/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200185/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200185/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200185/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200185/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200185/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200185/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
