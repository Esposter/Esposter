import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/201000/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/201000/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/201000/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/201000/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/201000/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/201000/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/201000/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/201000/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/201000/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/201000/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/201000/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/201000/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/201000/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/201000/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/201000/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
