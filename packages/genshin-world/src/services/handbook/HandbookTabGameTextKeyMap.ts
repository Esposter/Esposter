import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { GameTextKey } from "genshin-text";

export const HandbookTabGameTextKeyMap = {
  [HandbookTab.Commissions]: GameTextKey.HandbookCommissions,
  [HandbookTab.Domains]: GameTextKey.HandbookDomains,
  [HandbookTab.Embattle]: GameTextKey.HandbookEmbattle,
  [HandbookTab.Enemies]: GameTextKey.HandbookEnemies,
  [HandbookTab.Experience]: GameTextKey.HandbookExperience,
  [HandbookTab.Guide]: GameTextKey.HandbookGuide,
} as const satisfies Record<HandbookTab, GameTextKey>;
