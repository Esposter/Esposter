// Her Flower of Life picked to be worn, with the bag's pieces for it listed highest rarity first, then highest level
export const props = {
  closeLabel: "Cancel",
  options: [
    { caption: "+16", id: "1", name: "Flower of Life", rarity: 5 },
    { caption: "+8", id: "0", name: "Flower of Life", rarity: 4 },
  ],
  title: "Equip",
};

// The bag holds no piece for the slot, so the picker lists nothing
export const variants = { empty: { options: [] } };
