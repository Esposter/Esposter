import { createUniqueArraySchema } from "@esposter/shared";
import { characterPackFileSchema } from "genshin-world";
import { z } from "zod";

// A pack's manifest.json as the owner's extraction writes it: the avatar's id, its name where the extraction found one and
// Omitted where it found none, then each file of its folder except the manifest itself, with its path inside the folder,
// Its bytes and the sha256 of its content
export interface CharacterPackManifest {
  avatarId: string;
  files: { bytes: number; path: string; sha256: string }[];
  name?: string;
}

export const characterPackManifestSchema: z.ZodType<CharacterPackManifest> = z.object({
  avatarId: z.string().regex(/^\d+$/u),
  files: createUniqueArraySchema(characterPackFileSchema, "path"),
  name: z.string().min(1).optional(),
});
