// The weapon wish's Epitomized Path and one Intertwined Fate's Fate Points, shared with the wish screen's fixture
export const PATH_LABEL = "Epitomized Path";
export const FATE_POINTS = [{ text: "Fate Point: " }, { color: "#f39000", text: "0" }, { text: "/1" }];
export const POOL = [
  { id: 15_502, isFeatured: true, name: "Amos' Bow", rarity: 5 },
  { id: 11_501, isFeatured: false, name: "Aquila Favonia", rarity: 5 },
  { id: 11_401, isFeatured: true, name: "Favonius Sword", rarity: 4 },
  { id: 11_301, isFeatured: false, name: "Cool Steel", rarity: 3 },
];

// The weapon wish's Details popup with its Epitomized Path and one Intertwined Fate's Fate Points held
export const props = {
  closeLabel: "Back",
  fatePoints: FATE_POINTS,
  pathLabel: PATH_LABEL,
  pool: POOL,
  title: "Details",
};
