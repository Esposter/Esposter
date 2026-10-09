import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000052/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000052/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000052/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000052/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000052/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000052/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000052/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000052/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000052/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000052/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000052/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000052/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000052/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000052/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000052/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
