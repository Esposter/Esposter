import { z } from "zod";

// A reference's camera as `pose --write` records it: the eye's place in metres, its heading and pitch in degrees and
// Its field of view, the shape a world screen takes as its `cameraPose` prop
export const referenceCameraPoseSchema = z.object({
  fov: z.number(),
  heading: z.number(),
  pitch: z.number(),
  position: z.tuple([z.number(), z.number(), z.number()]),
});
