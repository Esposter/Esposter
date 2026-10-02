// The walkway assembling itself ahead of the camera as it glides, each piece rising from under the cloud into place:
// Settled up to 13.5 metres ahead and still rising out to 17.5, the rows where the English recording's walkway settles
// And ends at the camera's pose (745 and 730 of its 1080), each piece's rise staggered by up to 2 metres of its
// Neighbours', from 3 metres down. Past the rise a piece does not stand at all, so neither it nor its shadow shows
// Before its turn
export const LOGIN_WALKWAY_SETTLED_DISTANCE = 13.5;
export const LOGIN_WALKWAY_SUNK_DISTANCE = 17.5;
export const LOGIN_WALKWAY_RISE_STAGGER = 2;
export const LOGIN_WALKWAY_RISE_DEPTH = 3;
// How far a rising piece carries past its place before it settles back: the recording's far blocks stand stacked over
// The walkway's surface in steps of about 15 centimetres, three deep at 17 metres, as each overshoots and comes down
export const LOGIN_WALKWAY_RISE_OVERSHOOT = 0.45;
// The walkway's paving drawn into its texture at so many pixels a metre, and a pocket's stone as a share of its lane's:
// The exports' own plan of the walkway's tops reads its pockets at about 0.83 of its lane, but drawn beside the exports
// At every hour's camera our pockets match them best, by their structural similarity, at a twentieth darker
export const LOGIN_PAVING_PIXELS_PER_METRE = 128;
export const LOGIN_PAVING_POCKET_SHADE = 0.95;
