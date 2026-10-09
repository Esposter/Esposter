import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000099/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000099/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000099/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000099/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000099/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000099/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000099/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000099/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000099/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000099/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000099/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000099/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000099/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000099/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000099/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
