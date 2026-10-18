import { WeaponMenuTab } from "#src/models/WeaponMenuTab";

// The Enhance tab open on a three-star weapon at level one with no EXP yet, the three tabs the level and its phase allow
export const props = {
  actionLabel: "Enhance",
  closeLabel: "Back",
  ascension: 0,
  experienceRatio: 0,
  experienceText: "0/400",
  isActionDisabled: true,
  levelText: "Lv. 1/20",
  name: "Silver Light",
  rarity: 3,
  refinement: 1,
  tab: WeaponMenuTab.Enhance,
  tabs: [
    { label: "Enhance", tab: WeaponMenuTab.Enhance },
    { label: "Ascend", tab: WeaponMenuTab.Ascend },
    { label: "Refine", tab: WeaponMenuTab.Refine },
  ],
};

// The Ascend tab on the same weapon at its phase's cap, its lit phase one further and its action enabled
export const variants = {
  ascend: {
    actionLabel: "Ascend",
    ascension: 1,
    experienceRatio: 0,
    experienceText: "",
    isActionDisabled: false,
    levelText: "Lv. 20/20",
    tab: WeaponMenuTab.Ascend,
  },
};

export const slot = "Enhancement ores";
