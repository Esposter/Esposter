import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The landmarks a jump lands at, as the game teleports to its waypoints and statues and nowhere else
export const JUMP_LANDMARK_KINDS: readonly LandmarkKind[] = [
  LandmarkKind.StatueOfTheSeven,
  LandmarkKind.TeleportWaypoint,
];
// Provisional: the game's own arrival point for each statue, its scene point's transport place. How far in front of a
// Landmark a jump lands, in metres, clear of a statue's plinth
export const JUMP_STANDOFF_DISTANCE = 8;
// How near a locked jump landmark the HUD points to it, and how far it stays pointed to once the player is past the
// Show distance, in metres, as the wiki gives the two. The gap between them keeps the pointer from flickering at the show distance
export const NAVIGATION_POINTER_SHOW_DISTANCE = 30;
export const NAVIGATION_POINTER_HIDE_DISTANCE = 40;
// Provisional: how far in from the screen's edge the navigation mark is held, as a share of the screen, so the mark sits
// Inside the screen. Not yet read off the game's pointer at the edge
export const NAVIGATION_MARK_INSET_SHARE = 0.04;
// Provisional: the metres from the minimap's centre to its rim, not yet read off the game's minimap against the world
export const MINIMAP_RADIUS = 120;
// Provisional: the ground the map's drawing stands on where the game paints its terrain, which is not drawn here, read
// Off the English PC client's map over Jueyun Karst at 1080 high. The overlay and the minimap each stand it under the
// Drawing, so the two views show the world alike
export const MAP_GROUND = "#111317";
// Provisional: the map's marks measured off the game's map with the HUD's reference. A mark's radius is a share of the
// Extent a view shows, so it is drawn one size at any view's scale
export const MAP_MARK_SHARE = 0.02;
// Provisional: the open map's disc at the reference's scale, about 13 pixels of 1080 high. The minimap keeps its own
// Share, its view being a fraction of the open map's extent
export const MAP_OVERLAY_MARK_SHARE = 0.0068;
// An area's name and its progress line, each a share of the open map's extent so they are drawn at the view's own scale.
// Read off the English PC client's map over Galesong Hill (yt-kgW2IgWKukg at 4.6 seconds, 1080p): the name's capitals
// 28.8 pixels high and the line's 16.0, their middles 45.9 apart, which Signika's capitals, 0.706 of its size as the page
// Draws them, take at these sizes at the default view's 4.8 pixels a metre
export const MAP_LABEL_SHARE = 0.02125;
export const MAP_PROGRESS_SHARE = 0.012;
export const MAP_PROGRESS_OFFSET_SHARE = 0.0227;
// Provisional: the metres the open map shows across its width at the zoom slider's default, centred on the player; not
// Yet read off the game's zoom levels, which needs the regions' true shapes to measure against
export const MAP_VIEW_METRES = 400;
// Provisional: the metres across the map's width at the slider's two ends, the closest and the furthest zoom. The range
// Is spaced so the default sits where the reference's slider thumb does, and is read off the game's levels when measured
export const MAP_VIEW_METRES_MIN = 100;
export const MAP_VIEW_METRES_MAX = 2800;
// Provisional: the share of the slider's track one wheel unit moves the zoom, a notch of the wheel moving it about a
// Tenth of the track. Not yet read off the game's wheel
export const MAP_WHEEL_ZOOM_SHARE = 0.0015;
// The slider's track in its own drawing's units, its top and its height, its drawing being that many units high
export const MAP_ZOOM_TRACK_TOP = 43;
export const MAP_ZOOM_TRACK_HEIGHT = 194;
export const MAP_ZOOM_DRAWING_HEIGHT = 270;
// The pixels a press must travel before it pans the map, so a press that stays put still chooses a landmark
export const MAP_DRAG_THRESHOLD_PIXELS = 4;
// How long a jump's fade to the loading screen takes, and its fade back in, in milliseconds. Read off the cross-region
// Teleport clip yt-UVCdkuNpmf4-world-teleport.mp4, which runs at 60000/1001 frames a second, so a frame is 1001/60 ms:
// The fade out is the 48 frames from the last still within 5 of the map's darkness (frame 63) to the first within 5 of
// The loading screen's plateau (frame 111), and the fade in the 12 frames from the last plateau still (frame 164) to
// The first within 5 of the world's darkness (frame 176). A cross-region teleport loads longer than a near one
export const TELEPORT_FADE_OUT_MS = 801;
export const TELEPORT_FADE_IN_MS = 200;
