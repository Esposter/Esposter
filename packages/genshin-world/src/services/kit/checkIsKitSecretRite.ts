import { HEXEREI_SECRET_RITE_MINIMUM } from "#src/services/kit/constants";
import { countKitHexereiMembers } from "#src/services/kit/countKitHexereiMembers";

// Whether a team holds Hexerei: Secret Rite, given its members' ids: two of them or more Hexerei
export const checkIsKitSecretRite = (characterIds: Iterable<number>): boolean =>
  countKitHexereiMembers(characterIds) >= HEXEREI_SECRET_RITE_MINIMUM;
