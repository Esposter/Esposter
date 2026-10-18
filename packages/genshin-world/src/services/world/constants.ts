// The region whose ground is the world's base, read whole and laid over by none of the others
export const WINDRISE_GROUND_REGION = "windrise";
// Mondstadt's plateau is not laid over Windrise's base: over the base it changes 2.2 km2 of the disc by 11 m on average,
// And against the game's own terrain tiles it takes the base from 3 m to 30 m RMS error. Clipped out of the disc instead,
// It would step 13 m on average at the disc's edge. It stays out until a measurement holds the overlap
export const MONDSTADT_GROUND_REGION = "mondstadt";
// The regions whose ground the world does not lay over Windrise's: Windrise's own base, read whole, and Mondstadt's
// Plateau, measured to overlap the base
export const UNLAID_GROUND_REGIONS: readonly string[] = [WINDRISE_GROUND_REGION, MONDSTADT_GROUND_REGION];
