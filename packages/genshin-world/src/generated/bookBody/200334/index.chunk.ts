import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200334/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200334/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200334/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200334/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200334/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200334/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200334/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200334/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200334/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200334/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200334/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200334/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200334/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200334/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200334/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
