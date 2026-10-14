import { CHARACTER_PACK_INDEX_PATH } from "#src/services/character/constants";
import { readJson } from "#src/services/shared/readJson";
import { createUniqueArraySchema, getResultAsync } from "@esposter/shared";
import { z } from "zod";

// The characters a host holds a pack for, by the index beside their folders, read once so a character with none is
// Drawn as its capsule without a request of its own
export const readCharacterPackIds = (characterPackBaseUrl: string): ReturnType<typeof getResultAsync<number[]>> =>
  getResultAsync(async () =>
    createUniqueArraySchema(z.int().positive()).parse(
      await readJson(`${characterPackBaseUrl}/${CHARACTER_PACK_INDEX_PATH}`),
    ),
  );
