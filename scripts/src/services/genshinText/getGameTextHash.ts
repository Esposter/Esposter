import { InvalidOperationError, Operation } from "@esposter/shared";

const HASH_REGEX = /^\d+$/u;
// A key's value is the game's own id for the string, which the manual text map files a hash under, or the hash
// Itself where the game names the string nothing
export const getGameTextHash = (id: string, manualTextMap: Map<string, string>): string => {
  if (HASH_REGEX.test(id)) return id;

  const hash = manualTextMap.get(id);
  if (!hash) throw new InvalidOperationError(Operation.Read, id, "is no id the manual text map files");
  return hash;
};
