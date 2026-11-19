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
// The procedural normal detail the door's frame and panel lean their normals by: a cell as wide as the exports' normal
// Map reads where the frame resolves no lobe (`readTextureWavelength`, 0.1061 metres), and the amplitude that brings our
// Mean lean to the exports' bend of 4.7203 degrees, solved at that wavelength (design.md)
export const LOGIN_DOOR_NORMAL_DETAIL_WAVELENGTH = 0.1061;
export const LOGIN_DOOR_NORMAL_DETAIL_AMPLITUDE = 0.00946;
