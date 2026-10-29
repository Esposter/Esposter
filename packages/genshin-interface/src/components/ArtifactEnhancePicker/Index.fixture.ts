// A worn Plume of Death enhanced with two of the bag's artifacts and one Sanctifying Unction, the Mora the choice costs
export const props = {
  autoAddLabel: "Auto Add",
  cancelLabel: "Cancel",
  confirmLabel: "Confirm",
  fodders: [
    { caption: "+0", id: "3", isSelected: true, name: "Plume of Death", rarity: 2 },
    { caption: "+4", id: "4", isSelected: true, name: "Plume of Death", rarity: 3 },
    { caption: "+0", id: "2", isSelected: false, name: "Plume of Death", rarity: 4 },
  ],
  isConfirmDisabled: false,
  levelLabel: "Lv. 2",
  materials: [{ count: 3, id: "105002", name: "Sanctifying Unction", selectedCount: 1 }],
  moraCost: 2600,
  moraLabel: "Mora",
  notice: "",
  title: "Enhance",
};

// The artifact is already at its top level, so the picker says so and Confirm is disabled
export const variants = {
  maxed: { fodders: [], isConfirmDisabled: true, materials: [], moraCost: 0, notice: "Max level reached" },
};
