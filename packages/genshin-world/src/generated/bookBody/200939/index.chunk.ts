import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200939/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200939/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200939/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200939/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200939/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200939/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200939/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200939/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200939/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200939/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200939/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200939/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200939/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200939/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200939/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
