import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200641/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200641/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200641/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200641/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200641/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200641/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200641/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200641/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200641/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200641/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200641/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200641/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200641/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200641/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200641/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
