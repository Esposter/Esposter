import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The landmarks a jump lands at, as the game teleports to its waypoints and statues and nowhere else
export const JUMP_LANDMARK_KINDS: readonly LandmarkKind[] = [LandmarkKind.StatueOfTheSeven];
// Provisional: the game's own arrival point for each statue, its scene point's transport place. How far in front of a
// Landmark a jump lands, in metres, clear of a statue's plinth
export const JUMP_STANDOFF_DISTANCE = 8;
// Provisional: the minimap measured off a recording of the English PC client's world HUD. The metres from the
// Minimap's centre to its rim
export const MINIMAP_RADIUS = 120;
// Provisional: the map's marks measured off the game's map with the HUD's reference. A mark's radius is a share of the
// Extent a view shows, so it is drawn one size at any view's scale
export const MAP_MARK_SHARE = 0.02;
// Provisional: the open map's disc at the reference's scale, about 13 pixels of 1080 high. The minimap keeps its own
// Share, its view being a fraction of the open map's extent
export const MAP_OVERLAY_MARK_SHARE = 0.0068;
// Provisional: an area's name at the reference's scale, about 34 pixels of 1080 high, and its dark outline a few pixels
// Wide, each a share of the open map's extent so it is drawn at the view's own scale
export const MAP_LABEL_SHARE = 0.0177;
export const MAP_LABEL_OUTLINE_SHARE = 0.0016;
// Provisional: an area's progress line, the count and the percentage, at about 60% of the name's size and a little under
// The name's baseline, not yet read off the game's map, which shows it at its own size and place
export const MAP_PROGRESS_SHARE = 0.0106;
export const MAP_PROGRESS_OFFSET_SHARE = 0.0265;
// Provisional: the metres the open map shows across its width at the zoom slider's default, centred on the player; not
// Yet read off the game's zoom levels, which needs the regions' true shapes to measure against
export const MAP_VIEW_METRES = 400;
// Provisional: a recording of a teleport, read frame by frame. How long a jump's fade to black and its fade back in
// Take, in milliseconds
export const TELEPORT_FADE_OUT_MS = 400;
export const TELEPORT_FADE_IN_MS = 600;
