// The distance, in game units, within which two enemy marks of one kind join one camp. Provisional: the map gives no
// Camp membership, and a hand-placed camp's three fighters lie within five units of one another, so ten leaves room for
// A wider camp. No measure checks it, so it stays provisional until a camp's extent is read from the game
export const CAMP_CLUSTER_DISTANCE = 10;

// The enemy level band the wiki's Adventure Rank table gives at World Level 0, from its lowest level to its highest,
// Shared by every region's camps. Provisional: the table gives one band for the whole world, not one per region
export const CAMP_LEVEL_BAND = { max: 36, min: 1 };

// The level every enemy of a camp is given: the middle of the band, as an estimate until a camp's own level is read
export const CAMP_LEVEL = Math.floor((CAMP_LEVEL_BAND.min + CAMP_LEVEL_BAND.max) / 2);
