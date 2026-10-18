import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { GameTextKey } from "genshin-text";

// One domain in the Adventurer Handbook's Domains tab: its entrance, the title its row shows, and what the player can do
export interface HandbookDomain {
  entryId: number;
  // A weekly boss's first clear, claimable once its highest difficulty is cleared
  isFirstClearClaimable: boolean;
  isLocked: boolean;
  // A locked weekly boss the player can challenge from the handbook from Adventure Rank 40
  isQuickChallengeable: boolean;
  landmark: DomainEntranceLandmark;
  titleTextKey: GameTextKey;
}
