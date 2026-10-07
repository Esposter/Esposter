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
