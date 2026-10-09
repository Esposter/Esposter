import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200040/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200040/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200040/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200040/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200040/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200040/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200040/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200040/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200040/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200040/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200040/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200040/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200040/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200040/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200040/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
