import { FATE_POINTS, PATH_LABEL, POOL } from "#src/components/WishDetails/Index.fixture";
import { BannerKind } from "#src/models/BannerKind";

const BANNER_LABELS = {
  [BannerKind.Beginners]: [{ text: "Beginners' " }, { color: "#C8A078FF", text: "wish" }],
  [BannerKind.CharacterEvent]: [{ text: "Character Event Wish" }],
  [BannerKind.Standard]: [{ text: "Standard Wish" }],
  [BannerKind.WeaponEvent]: [{ text: "Weapon Event Wish" }],
};

// The weapon wish open with its pool and its Epitomized Path, one Intertwined Fate held, and a draw shown over it, the
// Highest rarity first
export const props = {
  backLabel: "Back",
  bannerId: "weapon-event",
  banners: [
    { id: "character-event", kind: BannerKind.CharacterEvent, label: BANNER_LABELS[BannerKind.CharacterEvent] },
    { id: "weapon-event", kind: BannerKind.WeaponEvent, label: BANNER_LABELS[BannerKind.WeaponEvent] },
    { id: "standard", kind: BannerKind.Standard, label: BANNER_LABELS[BannerKind.Standard] },
  ],
  currencies: [
    { id: "Primogem", name: "Primogem", quantity: 0 },
    { id: "IntertwinedFate", name: "Intertwined Fate", quantity: 1 },
  ],
  detailsLabel: "Details",
  fatePoints: FATE_POINTS,
  history: [
    { bannerLabel: "Character Event Wish", name: "Sample Character", rarity: 5, time: "2026-10-18T14:02" },
    { bannerLabel: "Standard Wish", name: "Sample Weapon", rarity: 3, time: "2026-10-17T09:30" },
  ],
  historyLabel: "History",
  pathLabel: PATH_LABEL,
  pool: POOL,
  probabilityLabel: "Probability increased!",
  purchases: [],
  results: [],
  sets: [
    { cost: "Intertwined Fate ×1", count: 1, isAffordable: true, label: "Wish ×1" },
    { cost: "Intertwined Fate ×10", count: 10, isAffordable: false, label: "Wish ×10" },
  ],
  shopLabel: "Shop",
  title: "Wish",
};
export const variants = {
  characterEvent: {
    bannerCard: {
      featuredTitle: "Dance of the Shimmering Wave",
      rateUp: "Every 10 wishes is guaranteed to include at least one 4-star or higher item.",
      title: [{ color: "#35AACCFF", text: "Born of" }, { text: " Ocean Swell" }],
    },
    bannerId: "character-event",
    pool: [
      { id: 10_000_051, isFeatured: true, name: "Eula", rarity: 5 },
      { id: 10_000_052, isFeatured: false, name: "Diluc", rarity: 5 },
      { id: 10_000_053, isFeatured: true, name: "Xingqiu", rarity: 4 },
    ],
  },
  results: {
    results: [
      {
        isCapturingRadiance: false,
        name: "Favonius Sword",
        rarity: 4,
        stellaFortuna: "",
        wishReturn: "Masterless Starglitter ×2",
      },
      {
        isCapturingRadiance: false,
        name: "Cool Steel",
        rarity: 3,
        stellaFortuna: "",
        wishReturn: "Masterless Stardust ×15",
      },
      {
        isCapturingRadiance: false,
        name: "Eula",
        rarity: 5,
        stellaFortuna: "Masterless Stella Fortuna ×1",
        wishReturn: "Masterless Starglitter ×25",
      },
    ],
  },
};
