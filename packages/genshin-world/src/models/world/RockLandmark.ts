import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A rock the game places in a region, drawn from the boxes of its hull by `createBoxesGeometry`. It keeps the place, turn
// And scale its record gives it, since a rock stands where the game sets it down and not on the ground beneath it, and
// Its hull's boxes, which every place of the hull shares. The hull's name is the mesh's, the same in every load of a
// Region, so a hull's geometry is found by it and never by the boxes' identity, which each load makes anew
export interface RockLandmark {
  boxes: readonly (readonly number[])[];
  hull: string;
  id: string;
  kind: LandmarkKind.Rock;
  place: [number, number, number];
  scale: [number, number, number];
  turn: [number, number, number, number];
}

export const rockLandmarkSchema = z.object({
  boxes: z.array(z.array(z.number()).length(6)),
  hull: z.string().min(1),
  id: z.string().min(1),
  kind: z.literal(LandmarkKind.Rock),
  place: z.tuple([z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]),
  turn: z.tuple([z.number(), z.number(), z.number(), z.number()]),
}) satisfies z.ZodType<RockLandmark>;
