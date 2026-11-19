import type { SurfaceDetail } from "genshin-engine";

// The light the door opens with, from the English recording
export const LOGIN_DOOR_GLOW_COLOR = 0x8fe8ff;
// The door's front relief drawn into its texture at so many pixels a metre, a pixel half a centimetre, as it was traced
export const LOGIN_DOOR_RELIEF_PIXELS_PER_METRE = 200;
// The door's light: a line down its middle this many metres to its half width, over a glow across the whole panel
export const LOGIN_DOOR_SLIT_WIDTH = 0.04;
export const LOGIN_DOOR_SLIT_STRENGTH = 4;
export const LOGIN_DOOR_PANEL_STRENGTH = 0.6;
// The game's material for the door's panel, which lights as ours does where the exports draw the door
export const LOGIN_DOOR_PANEL_MATERIAL = "LoginScene_Door02";
// The procedural normal detail the door's frame and panel lean their normals by: a cell as wide as the lobe its exported
// Normal map holds across the most high-pass boxes (`readTextureWavelength`, 13 texels, 0.0354 metres), and the amplitude
// That brings our mean lean to the exports' bend of 4.7203 degrees, solved at that wavelength (design.md)
export const LOGIN_DOOR_NORMAL_DETAIL_WAVELENGTH = 0.0354;
export const LOGIN_DOOR_NORMAL_DETAIL_AMPLITUDE = 0.00321;
// The door's grain over its relief: their exports' structure less the relief's own over their pixels (the surface pass's
// Terms, variance then bands finest first), each divided by their mean lightness of 0.6464 squared, and by the share of a
// Target a reading realised (0.22, as the bridges' and towers' first fits did). At a pixel's 0.0199 metres at the door's
// Depth. The octave amplitudes that reproduce these are solved by `computeSurfaceOctaves`
export const LOGIN_DOOR_SURFACE_DETAIL: SurfaceDetail = {
  bands: [0.00235966, 0.00026478, 0.00032805, 0.00006923],
  metresPerTexel: 0.0199,
  variance: 0.005833,
};
