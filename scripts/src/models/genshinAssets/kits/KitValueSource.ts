import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { z } from "zod";

// How one value of a kit's record is known: gcsim's file and line at the tag, the table's group and parameter with its
// Label, the wiki page at its revision and the row of its Advanced Properties, a builder rule, or the overlay's cause.
// A Value a rule derives from gcsim's, as a box priced as a circle, carries the rule's shared cause beside the file
export type KitValueSource =
  | { cause: KitProvisionalCause; source: typeof KitSource.Overlay }
  | {
      cause?: KitProvisionalCause | undefined;
      donor?: number | undefined;
      rule: KitRule;
      source: typeof KitSource.Rule;
    }
  | { cause?: KitProvisionalCause | undefined; file: string; line: number; source: typeof KitSource.Gcsim }
  | { index: number; label: string; proudSkillGroupId: number; source: typeof KitSource.Tables }
  | { page: string; revisionId: number; row: number; source: typeof KitSource.Wiki };

export const kitValueSourceSchema: z.ZodType<KitValueSource> = z.discriminatedUnion("source", [
  z.object({
    cause: z.enum(KitProvisionalCause).optional(),
    file: z.string().min(1),
    line: z.int().positive(),
    source: z.literal(KitSource.Gcsim),
  }),
  z.object({
    cause: z.enum(KitProvisionalCause).optional(),
    donor: z.int().positive().optional(),
    rule: z.enum(KitRule),
    source: z.literal(KitSource.Rule),
  }),
  z.object({ cause: z.enum(KitProvisionalCause), source: z.literal(KitSource.Overlay) }),
  z.object({
    index: z.int().nonnegative(),
    label: z.string().min(1),
    proudSkillGroupId: z.int().positive(),
    source: z.literal(KitSource.Tables),
  }),
  z.object({
    page: z.string().min(1),
    revisionId: z.int().positive(),
    row: z.int().positive(),
    source: z.literal(KitSource.Wiki),
  }),
]) satisfies z.ZodType<KitValueSource>;
