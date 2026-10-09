import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000107/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000107/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000107/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000107/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000107/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000107/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000107/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000107/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000107/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000107/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000107/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000107/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000107/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000107/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000107/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
