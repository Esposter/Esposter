// Xilonen's normal attack at level 10 and her Elemental Skill and Burst at 13, as the English client's Talents tab shows
// Them at 159 seconds, every one at its last level, so none draws an Upgrade and none names why it cannot rise. Her four
// Passives sit beneath them by name
export const props = {
  costs: [[], [], []],
  isUpgradeDisabled: [true, true, true],
  levelTexts: ["Lv. 10", "Lv. 13", "Lv. 13"],
  names: ["Ehecatl's Roar", "Yohual's Scratch", "Ocelotlicue Point!"],
  passiveNames: [
    "Netotiliztli's Echoes",
    "Portable Armored Sheath",
    "Night Realm's Gift: Blessing of Forge-Fire",
    "Tour of Tepeilhuitl",
  ],
  phases: ["", "", ""],
  reasons: ["", "", ""],
  upgradeLabel: "Level Up",
};

// Her normal attack at level 9, which the next level takes Ascension Phase 4 and Mora for, its Upgrade enabled, while
// Her other two talents stay at their last level
export const variants = {
  rising: {
    costs: [["Mora ×60000"], [], []],
    isUpgradeDisabled: [false, true, true],
    levelTexts: ["Lv. 9", "Lv. 13", "Lv. 13"],
    phases: ["Requires Character Ascension Phase 4", "", ""],
    reasons: ["", "", ""],
  },
};
