import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200915/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200915/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200915/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200915/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200915/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200915/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200915/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200915/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200915/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200915/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200915/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200915/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200915/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200915/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200915/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
