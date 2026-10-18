import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { z } from "zod";

// One value of a kit's overlay: a value no source holds with its cause, a value removed with its cause where a source
// Holds one the kit does not, or the source chosen where the sources disagree. A source chosen by a join, a named hit's
// Multiplier joined to its talent row, carries the value it joined by, as the join needs it to find the row
// A value gcsim writes inline is cited by the file of its character's folder and the line it is on, which evaluates to it.
// A value borrowed from a donor names the donor's character and the path of the value in the donor's record, its index
// Being the donor's where the borrower's differs, and carries no value of its own
export interface KitDonor {
  characterId: number;
  path: string;
}

export type KitOverlayEntry =
  | { cause: KitProvisionalCause; donor?: KitDonor; value?: unknown }
  | { file: string; index?: number; line: number; source: KitSource.Gcsim; value?: unknown }
  | { source: KitSource.Gcsim | KitSource.Tables | KitSource.Wiki; value?: unknown };

export const kitDonorSchema: z.ZodType<KitDonor> = z.strictObject({
  characterId: z.int().positive(),
  path: z.string().min(1),
});

export const kitOverlayEntrySchema: z.ZodType<KitOverlayEntry> = z.union([
  z
    .strictObject({
      cause: z.enum(KitProvisionalCause),
      donor: kitDonorSchema.optional(),
      value: z.unknown().optional(),
    })
    .refine(
      ({ cause, donor, value }) =>
        donor === undefined
          ? cause !== KitProvisionalCause.BorrowedFromDonor
          : cause === KitProvisionalCause.BorrowedFromDonor && value === undefined,
      "a borrowed value names its donor and no value of its own, and only a borrowed value names a donor",
    ),
  z.strictObject({
    file: z.string().min(1),
    line: z.int().positive(),
    source: z.literal(KitSource.Gcsim),
    value: z.unknown().optional(),
  }),
  z.strictObject({
    source: z.enum([KitSource.Gcsim, KitSource.Tables, KitSource.Wiki]),
    value: z.unknown().optional(),
  }),
]);
