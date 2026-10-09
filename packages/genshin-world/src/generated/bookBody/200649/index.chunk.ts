import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200649/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200649/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200649/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200649/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200649/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200649/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200649/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200649/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200649/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200649/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200649/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200649/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200649/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200649/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200649/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
