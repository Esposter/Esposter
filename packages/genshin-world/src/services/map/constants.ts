import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The landmarks a jump lands at, as the game teleports to its waypoints and statues and nowhere else
export const JUMP_LANDMARK_KINDS: readonly LandmarkKind[] = [LandmarkKind.StatueOfTheSeven];
// Provisional: the game's own arrival point for each statue, its scene point's transport place. How far in front of a
// Landmark a jump lands, in metres, clear of a statue's plinth
export const JUMP_STANDOFF_DISTANCE = 8;
// Provisional: the minimap measured off a recording of the English PC client's world HUD. The metres from the
// Minimap's centre to its rim
export const MINIMAP_RADIUS = 120;
// Provisional: the map's marks and names measured off the game's map with the HUD's reference. A mark's radius and a
// Name's height, each a share of the extent a view shows, so both are drawn one size at any view's scale
export const MAP_MARK_SHARE = 0.02;
export const MAP_LABEL_SHARE = 0.025;
// The share of the drawn extent the map overlay leaves round what it draws, so nothing sits on its edge
export const MAP_MARGIN = 0.1;
// The camera's pointer on a unit square, pointing north, as the overlay draws it where the camera stands and the
// Minimap at its centre
export const MAP_POINTER_PATH = "M 0 -1.6 L 1 1 L 0 0.4 L -1 1 Z";
// Provisional: a recording of a teleport, read frame by frame. How long a jump's fade to black and its fade back in
// Take, in milliseconds
export const TELEPORT_FADE_OUT_MS = 400;
export const TELEPORT_FADE_IN_MS = 600;
