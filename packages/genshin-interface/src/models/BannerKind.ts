// The game's kinds of wish, each with its own rates and its own counters: the character event wish, its second banner
// Included, the weapon event wish, the standard wish and the beginners' wish
export enum BannerKind {
  Beginners = "Beginners",
  CharacterEvent = "CharacterEvent",
  Standard = "Standard",
  WeaponEvent = "WeaponEvent",
}

// In the order the game shows them across the wish screen's head. It is written out, since lint sorts an enum's members
// And the enum's own order is alphabetical
export const BannerKinds: readonly BannerKind[] = [
  BannerKind.Beginners,
  BannerKind.CharacterEvent,
  BannerKind.WeaponEvent,
  BannerKind.Standard,
];
