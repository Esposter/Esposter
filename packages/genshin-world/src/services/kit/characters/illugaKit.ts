import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const ILLUGA_CHARACTER_ID = 10_000_127;

// Illuga's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from
// Borrowed donors' gcsim hitmarks and areas.
// Constellation 1 needs his Geo reactions and their 15-second cooldown, which the kit does not read
// Constellation 2 needs Haunted Night's Oriole-Song effect and its stacks from his burst, not built
// Constellation 4 needs Solarhunting Wolf's Oriole-Song stacks and damage, which the kit does not build
// Constellation 6 needs the Torchforger's Covenant Lightkeeper's Oath enhancement, which the kit does not build
export const createIllugaKitBehaviour = (): KitBehaviour => ({});
