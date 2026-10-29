import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The hosted index of the official character packs, one record of the game data: each published avatar with its name and
// Every file of its folder, the path inside the folder with forward slashes, its bytes and the sha256 of its content, so a
// File's request url and its cache key come from the index alone, without a pack's manifest
export interface CharacterPackIndex {
  avatars: { avatarId: number; files: { bytes: number; path: string; sha256: string }[]; name: string }[];
}

export const characterPackIndexSchema = z.object({
  avatars: createUniqueArraySchema(
    z.object({
      avatarId: z.int().positive(),
      files: createUniqueArraySchema(
        z.object({ bytes: z.int().nonnegative(), path: z.string().min(1), sha256: z.hash("sha256") }),
        "path",
      ),
      name: z.string().min(1),
    }),
    "avatarId",
  ),
}) satisfies z.ZodType<CharacterPackIndex>;
