import { RAIDEN_SHOGUN_AVATAR_ID } from "#src/services/cooking/constants";

// Whether a character may cook at all. The game refuses Raiden Shogun, so no dish is made with her
export const checkCanCookWith = (avatarId: number): boolean => avatarId !== RAIDEN_SHOGUN_AVATAR_ID;
