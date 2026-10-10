import { z } from "zod";

// The login walkway as its fit traced it: the height its underside sits at, the height its top sits at, and its pieces
export interface LoginWalkway {
  bottom: number;
  pieces: LoginWalkwayPieceData[];
  top: number;
}
// One piece of the walkway: its outline seen from above, the height it tops out at and the parts raised over its stone
interface LoginWalkwayPieceData {
  outline: number[][];
  raised: LoginWalkwayRaisedPart[];
  top: number;
}
// A part raised over a walkway piece's stone, its curb or its lane's border: its outline seen from above and the height
// It tops out at
interface LoginWalkwayRaisedPart {
  outline: number[][];
  top: number;
}

const loginWalkwayRaisedPartSchema = z.object({
  outline: z.array(z.array(z.number()).length(2)),
  top: z.number(),
}) satisfies z.ZodType<LoginWalkwayRaisedPart>;
const loginWalkwayPieceDataSchema = z.object({
  outline: z.array(z.array(z.number()).length(2)),
  raised: z.array(loginWalkwayRaisedPartSchema),
  top: z.number(),
}) satisfies z.ZodType<LoginWalkwayPieceData>;

export const loginWalkwaySchema = z.object({
  bottom: z.number(),
  pieces: z.array(loginWalkwayPieceDataSchema),
  top: z.number(),
}) satisfies z.ZodType<LoginWalkway>;
