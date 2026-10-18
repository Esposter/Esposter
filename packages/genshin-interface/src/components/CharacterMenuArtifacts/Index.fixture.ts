// Xilonen with no artifact worn, the state her record in the parity fixture holds, the first slot picked so Equip is what
// The panel offers, which no artifact in the bag can take yet, and no set bonus active
export const props = {
  enhanceLabel: "Enhance",
  equipLabel: "Equip",
  isEquipDisabled: true,
  noSetBonusLabel: "No Set Bonus",
  setBonusHeading: "Set Bonus",
  setBonusLines: [],
  slotNames: ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"],
  slotStats: [undefined, undefined, undefined, undefined, undefined],
  unequipLabel: "Unequip",
};

// Her Flower of Life worn and picked, so Unequip is offered in place of Equip, with its stats drawn under the details pill
// And a two-piece bonus active. The piece's values and the bonus's effect are provisional samples, not the game's
export const variants = {
  worn: {
    setBonusLines: ["2-Piece Set: Attack +18%"],
    slotStats: [
      {
        mainStat: { label: "Max HP", value: "+4,780" },
        subStats: [
          { label: "ATK", value: "+19" },
          { label: "CRIT Rate", value: "+3.1%" },
          { label: "CRIT DMG", value: "+6.2%" },
          { label: "Energy Recharge", value: "+5.8%" },
        ],
      },
      undefined,
      undefined,
      undefined,
      undefined,
    ],
  },
};
