import type { GameDataKey } from "#src/generated/gameDataKeys";

import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A palette colour is its hex as the publish writes it, read as the number a material is coloured with
const paletteColourSchema = z
  .object({
    hex: z
      .string()
      .regex(/^#[\da-f]{6}$/iu)
      .transform((hex) => Number.parseInt(hex.slice(1), 16)),
  })
  .transform(({ hex }) => hex);
// The reader of a kit's palette record, fetched by its key from the hosted game data and checked against its schema
// As it arrives. Each colour in it is optional: one the record leaves out reads as the kit's own constant
export const createPaletteReader =
  <T extends Record<string, number>>(key: GameDataKey, defaults: T) =>
  (gameDataBaseUrl: string): Promise<T> =>
    readGameData(
      gameDataBaseUrl,
      key,
      z
        .object(Object.fromEntries(Object.keys(defaults).map((colour) => [colour, paletteColourSchema.optional()])))
        .transform((colours) => ({ ...defaults, ...colours })),
    );
