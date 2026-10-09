import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

// Written by `pnpm -C scripts genshin:assets profile`, never by hand. Each language's chunk is a dynamic import of its own,
// So a reader downloads only the language it reads
export default {
  ChineseSimplified: async () => (await import("#src/generated/profile/10000039/ChineseSimplified.json")).default,
  ChineseTraditional: async () => (await import("#src/generated/profile/10000039/ChineseTraditional.json")).default,
  English: async () => (await import("#src/generated/profile/10000039/English.json")).default,
  French: async () => (await import("#src/generated/profile/10000039/French.json")).default,
  German: async () => (await import("#src/generated/profile/10000039/German.json")).default,
  Indonesian: async () => (await import("#src/generated/profile/10000039/Indonesian.json")).default,
  Italian: async () => (await import("#src/generated/profile/10000039/Italian.json")).default,
  Japanese: async () => (await import("#src/generated/profile/10000039/Japanese.json")).default,
  Korean: async () => (await import("#src/generated/profile/10000039/Korean.json")).default,
  Portuguese: async () => (await import("#src/generated/profile/10000039/Portuguese.json")).default,
  Russian: async () => (await import("#src/generated/profile/10000039/Russian.json")).default,
  Spanish: async () => (await import("#src/generated/profile/10000039/Spanish.json")).default,
  Thai: async () => (await import("#src/generated/profile/10000039/Thai.json")).default,
  Turkish: async () => (await import("#src/generated/profile/10000039/Turkish.json")).default,
  Vietnamese: async () => (await import("#src/generated/profile/10000039/Vietnamese.json")).default,
} satisfies Readonly<Record<GameLanguage, () => Promise<ProfileText>>>;
