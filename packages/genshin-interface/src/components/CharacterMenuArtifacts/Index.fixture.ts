// Xilonen with no artifact worn, the state her record in the parity fixture holds, the first slot picked so Fast Equip is
// What the panel offers, which no artifact in the bag can take yet, and no set bonus active
export const props = {
  artifactDetailsLabel: "Artifact Details",
  enhanceLabel: "Enhance",
  equipDisabledSlots: [true, true, true, true, true],
  equipLabel: "Equip",
  fastEquipLabel: "Fast Equip",
  lockLabel: "Lock",
  noSetBonusLabel: "No Set Bonus",
  setBonusHeading: "Set Bonus",
  setBonusLines: [],
  setName: "",
  slotNames: ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"],
  slotStats: [undefined, undefined, undefined, undefined, undefined],
  switchLabel: "Switch",
  totals: [
    { label: "Max HP", value: "+0" },
    { label: "ATK", value: "+0" },
    { label: "DEF", value: "+0" },
    { label: "Elemental Mastery", value: "+0" },
  ],
  unequipLabel: "Unequip",
  unlockLabel: "Unlock",
};

// Her Flower of Life worn and picked, so the details offer Unequip in place of Equip, with its stats drawn under the details
// Pill, and her five pieces of a set worn for the two- and four-piece bonuses. The totals and the piece's values are
// Provisional samples, not the game's
export const variants = {
  // The bag is full, so the Unequip the player pressed left the piece worn. The notice is a provisional sample line,
  // Not the game's card: the Character screen passes the game's own words in
  bagFull: { notice: "The bag is full." },
  worn: {
    setBonusLines: ["2-Piece Set: Attack +18%"],
    setName: "Scroll of the Hero of Cinder City",
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
    totals: [
      { label: "Max HP", value: "+6,009" },
      { label: "ATK", value: "+346" },
      { label: "DEF", value: "+1,398" },
      { label: "Elemental Mastery", value: "+100" },
    ],
  },
};
