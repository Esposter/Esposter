import { z } from "zod";

// The walkway's paving as `fitLoginPaving` traced it over one copy of the walkway: the bevel its rims fall at,
// Its plan's corner and size, the grooves and pockets cut into its stone, and the paint its tones are drawn in
export interface LoginPavingData {
  bevel: { slope: number; width: number };
  corner: number[];
  grooves: number[][][];
  grooveSlope: number;
  paint: { size: number[]; stone: number[]; tones: LoginPavingTone[] };
  pockets: number[][][];
  size: number[];
}
// A tone the walkway's stone is painted in: the loops it covers, and its shade
interface LoginPavingTone {
  loops: number[][][];
  shade: number[];
}

const loginPavingToneSchema = z.object({
  loops: z.array(z.array(z.array(z.number()).length(2))),
  shade: z.array(z.number()).length(3),
}) satisfies z.ZodType<LoginPavingTone>;

export const loginPavingDataSchema = z.object({
  bevel: z.object({ slope: z.number(), width: z.number().nonnegative() }),
  corner: z.array(z.number()).length(2),
  grooves: z.array(z.array(z.array(z.number()).length(2))),
  grooveSlope: z.number(),
  paint: z.object({
    size: z.array(z.number()).length(2),
    stone: z.array(z.number()).length(3),
    tones: z.array(loginPavingToneSchema),
  }),
  pockets: z.array(z.array(z.array(z.number()).length(2))),
  size: z.array(z.number()).length(2),
}) satisfies z.ZodType<LoginPavingData>;
