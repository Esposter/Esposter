// The facets round a fitted tower, enough for its outline against the sky to read round at the distances it stands
export const LOGIN_TOWER_RADIAL_SEGMENTS = 24;
// A tower's facade is drawn at two pixels a unit of its mesh, five centimetres as the scene scales it, so a window or a
// Gold band spans several pixels where the login's camera sees it nearest
export const LOGIN_TOWER_FACADE_PIXELS_PER_UNIT = 2;
// The pixels each tower's tile in the atlas runs on past its either edge, its surface carried on round its axis, so a
// Seam's filtering and the mipmaps' first levels read the tower's own facade rather than its neighbour's
export const LOGIN_TOWER_FACADE_GUTTER = 16;
// How far the facade's relief tilts the light across a recess's edge, as three's bump map scales it
export const LOGIN_TOWER_RELIEF_SCALE = 12;
// The geometry attribute each tower vertex reads its facade at, in the atlas's own coordinates
export const LOGIN_FACADE_ATTRIBUTE = "facade";
// How much of the light a recess keeps for each unit of its mesh it sinks in, the light its sides and its lintel
// Shut out of a window or a flute, which a lathe's smooth face cannot shade
export const LOGIN_TOWER_RECESS_OCCLUSION = 0.8;
