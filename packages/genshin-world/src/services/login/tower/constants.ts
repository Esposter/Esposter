import type { SurfaceDetail } from "genshin-engine";

// The facets round a fitted tower, enough for its outline against the sky to read round at the distances it stands
export const LOGIN_TOWER_RADIAL_SEGMENTS = 24;
// How far inside the wall a column starts, in units of the tower's mesh, half a cell of its facade, so no seam shows
// Between the column and the wall it stands on
export const LOGIN_TOWER_COLUMN_EMBED = 0.25;
// A tower's facade is drawn at two pixels a unit of its mesh, five centimetres as the scene scales it, so a window or a
// Gold band spans several pixels where the login's camera sees it nearest
export const LOGIN_TOWER_FACADE_PIXELS_PER_UNIT = 2;
// The pixels each tower's tile in the atlas runs on past its either edge, its surface carried on round its axis, so a
// Seam's filtering and the mipmaps' first levels read the tower's own facade rather than its neighbour's
export const LOGIN_TOWER_FACADE_GUTTER = 16;
// The geometry attribute each tower vertex reads its facade at, in the atlas's own coordinates
export const LOGIN_FACADE_ATTRIBUTE = "facade";
// The geometry attribute saying whether a tower vertex is its lathe's, which the facade's openings cut, or a slab's,
// Which stands whole
export const LOGIN_FACADE_CUT_ATTRIBUTE = "facadeCut";
// The procedural normal detail the towers' stone leans its normals by: a cell as wide as the exports' own surface
// Wavelength read from their frame (2.5648 metres), and the amplitude that brings our mean lean to the exports' bend of
// 3.1419 degrees, solved at that wavelength
// (openspec/changes/genshin-recreation-passes/design.md)
export const LOGIN_TOWER_NORMAL_DETAIL_WAVELENGTH = 2.5648;
export const LOGIN_TOWER_NORMAL_DETAIL_AMPLITUDE = 0.1619;
// The towers' grain over the facade's shades: their exports' structure less the facade's own over their pixels (the
// Surface pass's terms, variance then bands finest first), each divided by their mean lightness of 0.6187 squared, and
// By the share of a target the first fit's reading realised (0.22, the bridges' 0.185 to 0.264). At a pixel's 0.0712
// Metres at the towers' depth. The octave amplitudes that reproduce these are solved by `computeSurfaceOctaves`
export const LOGIN_TOWER_SURFACE_DETAIL: SurfaceDetail = {
  bands: [0.00071959, 0.00028423, 0.00023539, 0.00009561],
  metresPerTexel: 0.0712,
  variance: 0.00367214,
};
