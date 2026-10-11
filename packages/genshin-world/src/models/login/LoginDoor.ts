import { z } from "zod";

// The login's door as its fit traced it: its pieces, the samples a second each piece's lift is read at, where it stands
// And its relief
export interface LoginDoor {
  liftRate: number;
  pieces: LoginDoorPiece[];
  position: number[];
  relief: LoginDoorRelief;
  size: number[];
}
// A layer of the door's frame or of its panel: the depth it stands out at, and the loops that make it
interface LoginDoorLayer {
  depth: number;
  loops: LoginDoorLoop[];
}
// A loop of a door layer: its points, and the foot each point stands on below the layer
interface LoginDoorLoop {
  foot: number[][];
  points: number[][];
}
// One piece of the door: the layers of its frame and of its panel, and the samples its lift carries it through,
// Each its position then its turn as a quaternion
interface LoginDoorPiece {
  frame: LoginDoorLayer[];
  lift: number[][];
  panel: LoginDoorLayer[];
}
// The door's front relief: its corner, size and stone, and the tones its textures paint over it
interface LoginDoorRelief {
  corner: number[];
  size: number[];
  stone: number[];
  tones: LoginDoorTone[];
}
// A tone the door's front is painted in: the loops it covers and its shade
interface LoginDoorTone {
  loops: number[][][];
  shade: number[];
}

const loginDoorLoopSchema = z.object({
  foot: z.array(z.array(z.number()).length(2)),
  points: z.array(z.array(z.number()).length(2)),
}) satisfies z.ZodType<LoginDoorLoop>;
const loginDoorLayerSchema = z.object({
  depth: z.number(),
  loops: z.array(loginDoorLoopSchema),
}) satisfies z.ZodType<LoginDoorLayer>;
const loginDoorToneSchema = z.object({
  loops: z.array(z.array(z.array(z.number()).length(2))),
  shade: z.array(z.number()).length(3),
}) satisfies z.ZodType<LoginDoorTone>;
const loginDoorReliefSchema = z.object({
  corner: z.array(z.number()).length(2),
  size: z.array(z.number()).length(2),
  stone: z.array(z.number()).length(3),
  tones: z.array(loginDoorToneSchema),
}) satisfies z.ZodType<LoginDoorRelief>;
const loginDoorPieceSchema = z.object({
  frame: z.array(loginDoorLayerSchema),
  lift: z.array(z.array(z.number()).length(7)),
  panel: z.array(loginDoorLayerSchema),
}) satisfies z.ZodType<LoginDoorPiece>;

export const loginDoorSchema = z.object({
  liftRate: z.number().positive(),
  pieces: z.array(loginDoorPieceSchema),
  position: z.array(z.number()).length(3),
  relief: loginDoorReliefSchema,
  size: z.array(z.number()).length(3),
}) satisfies z.ZodType<LoginDoor>;
