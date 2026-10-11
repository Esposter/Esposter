import { z } from "zod";

// The login scene's bridges and pillars: each part's boxes by its name, each box its minimum and maximum corners, and
// Where every instance of a part stands
export interface LoginHulls {
  hulls: Record<string, number[][]>;
  placements: LoginHullPlacement[];
}
// One instance of a hull's part: which part it is, where it stands, its turn as a quaternion and its scale
interface LoginHullPlacement {
  hull: string;
  position: number[];
  rotation: number[];
  scale: number[];
}

const loginHullPlacementSchema = z.object({
  hull: z.string().nonempty(),
  position: z.array(z.number()).length(3),
  rotation: z.array(z.number()).length(4),
  scale: z.array(z.number()).length(3),
}) satisfies z.ZodType<LoginHullPlacement>;

export const loginHullsSchema = z.object({
  hulls: z.record(z.string(), z.array(z.array(z.number()).length(6))),
  placements: z.array(loginHullPlacementSchema),
}) satisfies z.ZodType<LoginHulls>;
