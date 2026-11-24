import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The hosted index of the official character packs, one record of the game data.
// Each published avatar has its name and every file of its folder.
// A file's path inside the folder uses forward slashes, and it has its bytes and the sha256 of its content.
// So a file's request url and its cache key come from the index alone, without a pack's manifest.
// The name is "" where the pack's manifest names none.
export interface CharacterPackIndex {
  avatars: { avatarId: number; files: { bytes: number; path: string; sha256: string }[]; name: string }[];
}

export const characterPackFileSchema = z.object({
  bytes: z.int().nonnegative(),
  path: z.string().min(1),
  sha256: z.hash("sha256"),
});

export const characterPackIndexSchema = z.object({
  avatars: createUniqueArraySchema(
    z.object({
      avatarId: z.int().positive(),
      files: createUniqueArraySchema(characterPackFileSchema, "path"),
      name: z.string(),
    }),
    "avatarId",
  ),
}) satisfies z.ZodType<CharacterPackIndex>;
