// Xilonen's normal attack at level 10 and her Elemental Skill and Burst at 13, as the English client's Talents tab shows
// Them at 159 seconds, every one at its last level, so each reads why it cannot rise and its Upgrade is disabled
export const props = {
  costs: [[], [], []],
  isUpgradeDisabled: [true, true, true],
  levels: [10, 13, 13],
  phases: ["", "", ""],
  reasons: ["Max level reached", "Max level reached", "Max level reached"],
  upgradeLabel: "Level Up",
};

// Her normal attack at level 9, which the next level takes Ascension Phase 4 and Mora for, its Upgrade enabled, while
// Her other two talents stay at their last level
export const variants = {
  rising: {
    costs: [["Mora ×60000"], [], []],
    isUpgradeDisabled: [false, true, true],
    levels: [9, 13, 13],
    phases: ["Requires Character Ascension Phase 4", "", ""],
    reasons: ["", "Max level reached", "Max level reached"],
  },
};
