import { ADVENTURE_ENCOUNTERS_UNLOCK_RANK } from "#src/services/commission/constants";

// Whether the Adventure Encounters panel is open at `rank`: from its unlock rank on, where its Encounter Points can be spent
export const checkIsAdventureEncountersUnlocked = (rank: number): boolean => rank >= ADVENTURE_ENCOUNTERS_UNLOCK_RANK;
