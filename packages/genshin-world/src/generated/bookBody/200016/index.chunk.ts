import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets archive`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/bookBody/200016/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/bookBody/200016/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/bookBody/200016/English.json")).default,
  French: async () => (await import("#src/generated/bookBody/200016/French.json")).default,
  German: async () => (await import("#src/generated/bookBody/200016/German.json")).default,
  Indonesian: async () => (await import("#src/generated/bookBody/200016/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/bookBody/200016/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/bookBody/200016/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/bookBody/200016/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/bookBody/200016/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/bookBody/200016/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/bookBody/200016/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/bookBody/200016/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/bookBody/200016/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/bookBody/200016/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<string>>>;
