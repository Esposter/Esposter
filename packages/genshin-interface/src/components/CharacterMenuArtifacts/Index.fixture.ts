// Xilonen with no artifact worn, the state her record in the parity fixture holds, the first slot picked so Equip is what
// The panel offers, which no artifact in the bag can take yet, and no set bonus active
export const props = {
  enhanceLabel: "Enhance",
  equipDisabledSlots: [true, true, true, true, true],
  equipLabel: "Equip",
  lockLabel: "Lock",
  noSetBonusLabel: "No Set Bonus",
  setBonusHeading: "Set Bonus",
  setBonusLines: [],
  slotNames: ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"],
  slotStats: [undefined, undefined, undefined, undefined, undefined],
  unequipLabel: "Unequip",
  unlockLabel: "Unlock",
};

// Her Flower of Life worn and picked, so Unequip is offered in place of Equip, with its stats drawn under the details pill
// And a two-piece bonus active. The piece's values and the bonus's effect are provisional samples, not the game's
export const variants = {
  // The bag is full, so the Unequip the player pressed left the piece worn and the game's card says why
  bagFull: { notice: "No space left in Artifact Inventory. Please free up some space and try again." },
  worn: {
    setBonusLines: ["2-Piece Set: Attack +18%"],
    slotStats: [
      {
        isLocked: false,
        mainStat: { label: "Max HP", value: "+4780" },
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
