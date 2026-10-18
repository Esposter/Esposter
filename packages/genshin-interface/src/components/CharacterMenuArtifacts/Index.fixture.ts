// Xilonen with no artifact worn, the state her record in the parity fixture holds, the first slot picked so Equip is what
// The panel offers, which no artifact in the bag can take yet, and no set bonus active
export const props = {
  enhanceLabel: "Enhance",
  equipLabel: "Equip",
  equipped: [false, false, false, false, false],
  isEquipDisabled: true,
  noSetBonusLabel: "No Set Bonus",
  setBonusHeading: "Set Bonus",
  setBonusLines: [],
  slotNames: ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"],
  unequipLabel: "Unequip",
};

// Her Flower of Life worn and picked, so Unequip is offered in place of Equip, with a two-piece bonus active. The bonus's
// Effect is a provisional sample, not a set's own text
export const variants = {
  worn: { equipped: [true, false, false, false, false], setBonusLines: ["2-Piece Set: Attack +18%"] },
};
