import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { z } from "zod";

// A Stellar Jubilee passive in a kit's record: the Stellar reactions it enables for its party
export interface KitStellarJubileeRecord {
  stellarReactionTypes: StellarReactionType[];
}

export const kitStellarJubileeRecordSchema = z.strictObject({
  stellarReactionTypes: z.array(z.enum(StellarReactionType)),
}) satisfies z.ZodType<KitStellarJubileeRecord>;
