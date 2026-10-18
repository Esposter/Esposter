// The distance, in game units, within which two enemy marks of one kind join one camp. Provisional: the map gives no
// Camp membership, and a hand-placed camp's three fighters lie within five units of one another, so ten leaves room for
// A wider camp. No measure checks it, so it stays provisional until a camp's extent is read from the game
export const CAMP_CLUSTER_DISTANCE = 10;
