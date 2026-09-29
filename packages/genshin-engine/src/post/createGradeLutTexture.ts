import type { GradeOptions } from "#src/post/GradeOptions";

import { computeGradeLut } from "#src/post/computeGradeLut";
import { Data3DTexture, LinearFilter } from "three";

// The grade's cube as a texture the LUT pass samples, filtered linearly so a small cube grades smoothly between its
// Texels. Its bytes are display values already, so no colour space converts them
export const createGradeLutTexture = (gradeOptions: GradeOptions): Data3DTexture => {
  const { size } = gradeOptions;
  const gradeLutTexture = new Data3DTexture(computeGradeLut(gradeOptions), size, size, size);
  gradeLutTexture.magFilter = LinearFilter;
  gradeLutTexture.minFilter = LinearFilter;
  gradeLutTexture.needsUpdate = true;
  return gradeLutTexture;
};
