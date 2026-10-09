import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000036/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000036/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000036/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000036/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000036/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000036/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000036/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000036/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000036/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000036/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000036/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000036/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000036/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000036/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000036/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
