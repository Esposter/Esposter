import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200645/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200645/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200645/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200645/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200645/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200645/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200645/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200645/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200645/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200645/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200645/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200645/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200645/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200645/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200645/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
