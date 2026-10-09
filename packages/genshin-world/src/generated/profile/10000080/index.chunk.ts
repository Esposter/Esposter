import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000080/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000080/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000080/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000080/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000080/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000080/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000080/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000080/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000080/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000080/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000080/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000080/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000080/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000080/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000080/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
