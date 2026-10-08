// The distance between the two samples the ground's slope is read across, in metres: a tenth, so a normal reads a
// Terrain's small hills as they are drawn rather than the average of a wide patch
export const GROUND_NORMAL_SPAN = 0.1;
// How far a cast sphere moves between its tests, as a share of its radius, so nothing thinner than half its width is
// Stepped over
export const SPHERE_CAST_STRIDE_SHARE = 0.5;
