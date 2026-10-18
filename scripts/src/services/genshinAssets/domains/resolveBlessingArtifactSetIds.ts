import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Each domain's artifact sets by entry id, from the wiki's name for each set, resolved to its set id: a set is named by the
// Text of its equip affix. A name no set answers to, or two sets answer to, is refused rather than guessed
export const resolveBlessingArtifactSetIds = (
  setNames: Readonly<Record<number, readonly string[]>>,
  reliquarySets: readonly ExcelReliquarySetRow[],
  equipAffixes: readonly ExcelEquipAffixRow[],
  textMap: ReadonlyMap<string, string>,
): Record<number, number[]> => {
  const equipAffixNameMap = new Map(
    equipAffixes.map(({ id, nameTextMapHash }) => [id, textMap.get(String(nameTextMapHash))]),
  );
  const setIdsByName = new Map<string, number[]>();
  for (const { equipAffixId, setId } of reliquarySets) {
    const name = equipAffixNameMap.get(equipAffixId);
    if (name !== undefined) setIdsByName.set(name, [...(setIdsByName.get(name) ?? []), setId]);
  }
  const resolveSetId = (name: string): number => {
    const setIds = setIdsByName.get(name) ?? [];
    const [setId] = setIds;
    if (setIds.length !== 1 || setId === undefined)
      throw new InvalidOperationError(Operation.Read, "reliquary sets", `names ${setIds.length} sets as ${name}`);
    return setId;
  };
  return Object.fromEntries(
    Object.entries(setNames).map(([entryId, names]) => [entryId, names.map((name) => resolveSetId(name))]),
  );
};
