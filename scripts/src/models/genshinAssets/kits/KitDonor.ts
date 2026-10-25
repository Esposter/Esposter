import { z } from "zod";

// A value borrowed from a donor names the donor's character and the path of the value in the donor's record, its index
// Being the donor's where the borrower's differs, and carries no value of its own
export interface KitDonor {
  characterId: number;
  path: string;
}

export const kitDonorSchema: z.ZodType<KitDonor> = z.strictObject({
  characterId: z.int().positive(),
  path: z.string().min(1),
});
