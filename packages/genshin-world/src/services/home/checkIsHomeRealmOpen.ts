import { HOME_REALM_UNLOCK_RANK } from "#src/services/home/constants";

// Whether the Serenitea Pot opens the realm for a player at this Adventure Rank, from the rank it opens at
export const checkIsHomeRealmOpen = (adventureRank: number): boolean => adventureRank >= HOME_REALM_UNLOCK_RANK;
