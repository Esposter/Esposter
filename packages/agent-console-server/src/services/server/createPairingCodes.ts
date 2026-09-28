import type { PairingCodes } from "#src/models/server/PairingCodes";

import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";

// The codes that may pair a page now: each pairs once, and only until it expires
export const createPairingCodes = (): PairingCodes => {
  const codeTimeoutMap = new Map<string, NodeJS.Timeout>();
  return {
    add: (code, duration) => {
      clearTimeout(codeTimeoutMap.get(code));
      codeTimeoutMap.set(
        code,
        setTimeout(() => {
          codeTimeoutMap.delete(code);
        }, duration),
      );
    },
    clear: () => {
      for (const timeout of codeTimeoutMap.values()) clearTimeout(timeout);
      codeTimeoutMap.clear();
    },
    take: (code) => {
      const heldCode = [...codeTimeoutMap.keys()].find((candidate) => checkIsTokenValid(code, candidate));
      if (heldCode === undefined) return false;
      clearTimeout(codeTimeoutMap.get(heldCode));
      codeTimeoutMap.delete(heldCode);
      return true;
    },
  };
};
