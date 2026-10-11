import type { SurfaceDetail } from "genshin-engine";

import { z } from "zod";

// A surface's detail as its export's textures hold it: the mean square of each octave band, finest first, and the
// Variance of the luminance they are measured against
export const surfaceDetailSchema = z.object({
  bands: z.array(z.number().nonnegative()),
  variance: z.number().nonnegative(),
}) satisfies z.ZodType<SurfaceDetail>;
