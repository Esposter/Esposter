import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200154/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200154/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200154/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200154/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200154/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200154/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200154/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200154/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200154/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200154/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200154/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200154/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200154/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200154/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200154/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
