import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200192/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200192/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200192/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200192/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200192/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200192/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200192/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200192/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200192/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200192/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200192/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200192/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200192/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200192/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200192/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
