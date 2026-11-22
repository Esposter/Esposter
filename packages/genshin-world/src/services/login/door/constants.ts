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
// That brings our mean lean to the exports' bend of 4.7203 degrees, solved at that wavelength
// (openspec/changes/genshin-recreation-passes/design.md)
export const LOGIN_DOOR_NORMAL_DETAIL_WAVELENGTH = 0.0354;
export const LOGIN_DOOR_NORMAL_DETAIL_AMPLITUDE = 0.00321;
// The door's grain over its relief: the targets `genshin:parity grain login --family Door` settles, a damped Newton over the
// Structure terms the door's own render reads (`fitSurfaceGrain`, `solveResidualsByNewton`), from the first fit's targets.
// At a pixel's 0.0199 metres at the door's depth. The octave amplitudes that reproduce these are solved by `computeSurfaceOctaves`
export const LOGIN_DOOR_SURFACE_DETAIL: SurfaceDetail = {
  bands: [0.0023766767, 0.00029254949, 0.0012959495, 0.000083161192],
  metresPerTexel: 0.0199,
  variance: 0.0054557945,
};
