import { FileKey } from "#shared/generated/phaser/FileKey";
import { z } from "zod";

// A monster's key is the texture it shows, but only the species portraits are ever one. Keeping the type to
// Those rather than to `FileKey` is also what lets `prettify` resolve a name: it recurses per character, so
// Distributing it over every file in the container exceeds the instantiation depth limit
export const MonsterFileKeys = [
  FileKey.UIMonstersAquavalor,
  FileKey.UIMonstersCarnodusk,
  FileKey.UIMonstersFrostsaber,
  FileKey.UIMonstersIgnivolt,
  FileKey.UIMonstersIguanignite,
] as const;

export type MonsterFileKey = (typeof MonsterFileKeys)[number];

export const monsterFileKeySchema = z.enum(MonsterFileKeys) satisfies z.ZodType<MonsterFileKey>;
