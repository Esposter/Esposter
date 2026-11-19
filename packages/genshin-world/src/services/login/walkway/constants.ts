import type { SurfaceDetail } from "genshin-engine";

// The walkway assembling itself ahead of the camera as it glides, each piece rising from under the cloud into place:
// Settled up to 13.5 metres ahead and still rising out to 17.5, the rows where the English recording's walkway settles
// And ends at the camera's pose (745 and 730 of its 1080), each piece's rise staggered by up to 2 metres of its
// Neighbours', from 3 metres down. Past the rise a piece does not stand at all, so neither it nor its shadow shows
// Before its turn
export const LOGIN_WALKWAY_SETTLED_DISTANCE = 13.5;
export const LOGIN_WALKWAY_SUNK_DISTANCE = 17.5;
export const LOGIN_WALKWAY_RISE_STAGGER = 2;
export const LOGIN_WALKWAY_RISE_DEPTH = 3;
// How far a rising piece carries past its place before it settles back: the recording's far blocks stand stacked over
// The walkway's surface in steps of about 15 centimetres, three deep at 17 metres, as each overshoots and comes down
export const LOGIN_WALKWAY_RISE_OVERSHOOT = 0.45;
// The walkway's paving drawn into its texture at so many pixels a metre:
// A rim a centimetre wide takes that many pixels to stand apart from its pocket
export const LOGIN_PAVING_PIXELS_PER_METRE = 256;
// The share of its rims' tilt the walkway's normals keep. Its exports' normal maps bend its normals 4.0000 degrees over its
// Family, and its rims drawn at their full fitted slope bend them 4.3467, so the share is the root of the bend over the
// Share, read by the Shape pass's surface detail reading: the secant through 1.0 (4.3467) and 0.92 (4.0385) lands at
// 0.9100, and the pass reads 0.0006 degrees there, inside its gate of 0.0198. Detail on top would only raise the bend
export const LOGIN_WALKWAY_RIM_TILT_SHARE = 0.91;
// The walkway's grain over its paving: the targets `genshin:parity grain login --family Walkway` settles, a damped Newton over
// The structure terms the walkway's own render reads (`fitSurfaceGrain`, `solveResidualsByNewton`). The paving already
// Overfills the band of the fourth octave past its exports, so that target stands at its floor of zero, and the terms
// Settle at a structure root mean square of 0.0214 against the surface pass's gate of 0.0268. At a pixel's 0.0069 metres
// At the walkway's depth. The octave amplitudes that reproduce these are solved by `computeSurfaceOctaves`
export const LOGIN_WALKWAY_SURFACE_DETAIL: SurfaceDetail = {
  bands: [0.000068039907, 0.00011268381, 0, 0.0012071159],
  metresPerTexel: 0.0069,
  variance: 0.0031098199,
};
