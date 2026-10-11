import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { z } from "zod";

// One value of a kit's overlay: a value no source holds with its cause, a value removed with its cause where a source
// Holds one the kit does not, or the source chosen where the sources disagree
export type KitOverlayEntry =
  | { cause: KitProvisionalCause; value?: unknown }
  | { source: KitSource.Gcsim | KitSource.Tables | KitSource.Wiki };

export const kitOverlayEntrySchema: z.ZodType<KitOverlayEntry> = z.union([
  z.strictObject({ cause: z.enum(KitProvisionalCause), value: z.unknown().optional() }),
  z.strictObject({ source: z.enum([KitSource.Gcsim, KitSource.Tables, KitSource.Wiki]) }),
]);
