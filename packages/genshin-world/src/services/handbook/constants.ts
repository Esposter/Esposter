import { HandbookTab } from "#src/models/handbook/HandbookTab";

// Each commission row's pitch in reference pixels, the game's five rows spanning 998 from the first's top to the last's
export const COMMISSION_STEP = 249.5;

// The handbook's tabs down its left edge, top to bottom, as the English client's draws them
export const HANDBOOK_TABS: readonly HandbookTab[] = [
  HandbookTab.Experience,
  HandbookTab.Commissions,
  HandbookTab.Domains,
  HandbookTab.Enemies,
  HandbookTab.Guide,
  HandbookTab.Embattle,
];
