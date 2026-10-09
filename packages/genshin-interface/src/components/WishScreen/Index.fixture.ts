import { BannerKind } from "#src/models/BannerKind";

const BANNER_LABELS = {
  [BannerKind.Beginners]: "Beginners' wish",
  [BannerKind.CharacterEvent]: "Character Event Wish",
  [BannerKind.Standard]: "Standard Wish",
  [BannerKind.WeaponEvent]: "Weapon Event Wish",
};

// The weapon wish open with its pool and its Epitomized Path, one Intertwined Fate held, and a draw shown over it, the
// Highest rarity first
export const props = {
  backLabel: "Back",
  bannerKind: BannerKind.WeaponEvent,
  bannerKinds: [BannerKind.CharacterEvent, BannerKind.WeaponEvent, BannerKind.Standard],
  bannerLabels: BANNER_LABELS,
  currencies: [
    { id: "Primogem", name: "Primogem", quantity: 0 },
    { id: "IntertwinedFate", name: "Intertwined Fate", quantity: 1 },
  ],
  fatePoints: "Fate Point: 0/1",
  pathLabel: "Epitomized Path",
  pool: [
    { id: 15_502, isFeatured: true, name: "Amos' Bow", rarity: 5 },
    { id: 11_501, isFeatured: false, name: "Aquila Favonia", rarity: 5 },
    { id: 11_401, isFeatured: true, name: "Favonius Sword", rarity: 4 },
    { id: 11_301, isFeatured: false, name: "Cool Steel", rarity: 3 },
  ],
  purchases: [],
  results: [],
  sets: [
    { cost: "Intertwined Fate ×1", count: 1, isAffordable: true, label: "Wish ×1" },
    { cost: "Intertwined Fate ×10", count: 10, isAffordable: false, label: "Wish ×10" },
  ],
  title: "Wish",
};
export const variants = {
  results: {
    results: [
      { isCapturingRadiance: false, name: "Favonius Sword", rarity: 4, wishReturn: "Masterless Starglitter ×2" },
      { isCapturingRadiance: false, name: "Cool Steel", rarity: 3, wishReturn: "Masterless Stardust ×15" },
    ],
  },
};
