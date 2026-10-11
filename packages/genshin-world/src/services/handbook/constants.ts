import { HandbookTab } from "#src/models/handbook/HandbookTab";

// Each commission row's pitch in reference pixels, the rows of the game's list sitting 248 apart
export const COMMISSION_STEP = 248;

// The handbook's tabs down its left edge, top to bottom, as the English client's draws them
export const HANDBOOK_TABS: readonly HandbookTab[] = [
  HandbookTab.Experience,
  HandbookTab.Commissions,
  HandbookTab.Domains,
  HandbookTab.Enemies,
  HandbookTab.Guide,
  HandbookTab.Embattle,
];
