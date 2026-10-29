import { WeaponMenuTab } from "#src/models/WeaponMenuTab";

// The Enhance tab open on a weapon below its level cap, the Details row above the three tabs the level and its phase allow
export const props = {
  actionLabel: "Enhance",
  closeLabel: "Back",
  detailsLabel: "Details",
  isActionDisabled: true,
  kind: "Sword",
  name: "Silver Light",
  tab: WeaponMenuTab.Enhance,
  tabs: [
    { label: "Enhance", tab: WeaponMenuTab.Enhance },
    { label: "Ascend", tab: WeaponMenuTab.Ascend },
    { label: "Refine", tab: WeaponMenuTab.Refine },
  ],
};

// The Ascend tab on the same weapon at its phase's cap, its action enabled
export const variants = { ascend: { actionLabel: "Ascend", isActionDisabled: false, tab: WeaponMenuTab.Ascend } };

export const slot = "Enhancement ores";
