// Provisional: how far the sight's range spreads from where it was turned on, in metres. No published source gives it,
// So It is estimated until the Elemental Sight clip (`elemental-sight.mkv`, a References sought entry) measures the
// Reach
export const SIGHT_REACH = 30;
// Provisional: how fast the range spreads, in metres a second. No published source gives it, so it is estimated until
// The Same clip measures it
export const SIGHT_SPREAD_SPEED = 25;
// Provisional: how far the character may walk from where the sight was turned on before it turns off, in metres. No
// Published source gives it, so it is estimated until the same clip measures the walk that ends it
export const SIGHT_WALK_LIMIT = 3;
// Provisional: how far apart the points of a sight trail sit on the ground, in metres. No published source gives it, so
// It is estimated until the same clip measures the trail
export const SIGHT_TRAIL_STEP = 1;
// The most points a trail has: one every step across the reach, and the reach's own end
export const SIGHT_TRAIL_POINT_CAPACITY = Math.ceil(SIGHT_REACH / SIGHT_TRAIL_STEP) + 1;
// The most trails the sight draws at once, which Mondstadt's thirty courts fit within
export const SIGHT_TRAIL_CAPACITY = 32;
// Provisional: how wide a sight trail is across the ground, in metres. No published source gives it, so it is estimated
// Until the same clip measures the trail
export const SIGHT_TRAIL_WIDTH = 0.5;
// Provisional: how much of its brightness a trail loses by its end, as a fraction. No published source gives it, so it
// Is Estimated until the same clip measures it
export const SIGHT_TRAIL_FADE = 0.5;
// How far a trail is lifted above the ground, in metres, so the ground's own triangles between its points never hide it
export const SIGHT_TRAIL_LIFT = 0.1;
// A thing no element is on shows white, as the wiki's colour key gives it for what no element affects
export const SIGHT_UNAFFECTED_COLOR = "#ffffff";
