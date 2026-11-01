import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { CharacterIdBluntOverrideMap } from "#src/services/genshinAssets/kits/wiki/CharacterIdBluntOverrideMap";
import { AttackTag, Element, WeaponType } from "genshin-world";

// The suffix every hit's hitmark is read under, which finds each hit of the record among the values
const HITMARK_SUFFIX = ".hitmarkFrames";
// The stance a path names, whose actions the kit plays in the slots of its own
const STANCE_PREFIX_REGEX = /^stances\.[^.]+\./u;
// The attack tag each slot's hits are dealt as, the tag the kit gives them when it enters the slot. A hold's or a
// Follow-up's hits are their skill's, and a named hit or a named action's hit is dealt as none
const SLOT_ATTACK_TAG_ENTRIES: readonly (readonly [RegExp, AttackTag])[] = [
  [/^(?:normalAttacks\.\d+|dash|jump)\.hits\.\d+$/u, AttackTag.NormalAttack],
  [/^chargedAttack(?:Variant)?\.hits\.\d+$/u, AttackTag.ChargedAttack],
  [/^(?:plunges\.(?:high|low)|plungeVariants\.\d+)\.hits\.\d+$/u, AttackTag.PlungingAttack],
  [/^plungeCollision$/u, AttackTag.PlungingAttack],
  [/^burst(?:Variant)?\.hits\.\d+$/u, AttackTag.ElementalBurst],
  [/^(?:skill|skillHolds\.\d+\.(?:action|variant)|skillChain\.followUps\.\d+)\.hits\.\d+$/u, AttackTag.ElementalSkill],
];
const MELEE_WEAPON_TYPES: ReadonlySet<WeaponType> = new Set([
  WeaponType.Claymore,
  WeaponType.Polearm,
  WeaponType.Sword,
]);

const getSlotAttackTag = (hitPath: string): AttackTag | undefined => {
  const slotPath = hitPath.replace(STANCE_PREFIX_REGEX, "");
  return SLOT_ATTACK_TAG_ENTRIES.find(([pattern]) => pattern.test(slotPath))?.[1];
};

// The blunt flag of each hit in a kit's record, over the values its sources, overlay and earlier rules give it, as
// The world's `checkIsBluntHit` reads the hit's own flag: the wiki's exception for the hit's path or its action where
// The table has one, else blunt as a claymore's normal or charged attack, as a melee weapon's plunge, or as Geo, the
// Element the hit names or its wielder's when it names none. A hit the rules leave non-blunt that its character's own
// Geo would blunt through its wielder names that Geo, so the world does not blunt it by the wielder's element
export const getBluntKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  { characterId, element, weaponType }: Pick<KitTables, "characterId" | "element" | "weaponType">,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const overrides = CharacterIdBluntOverrideMap[characterId];
  for (const path of valueMap.keys()) {
    if (!path.endsWith(HITMARK_SUFFIX)) continue;
    const hitPath = path.slice(0, -HITMARK_SUFFIX.length);
    const actionAttackTag = getSlotAttackTag(hitPath);
    const ownElement = valueMap.get(`${hitPath}.element`);
    const isGauged = valueMap.get(`${hitPath}.gauge`) !== undefined;
    const isGeo = (ownElement ?? (isGauged ? element : undefined)) === Element.Geo;
    const isWeaponBlunt =
      (weaponType === WeaponType.Claymore &&
        (actionAttackTag === AttackTag.NormalAttack || actionAttackTag === AttackTag.ChargedAttack)) ||
      (actionAttackTag === AttackTag.PlungingAttack && MELEE_WEAPON_TYPES.has(weaponType));
    const exception =
      overrides?.hits?.[hitPath] ?? (actionAttackTag === undefined ? undefined : overrides?.actions?.[actionAttackTag]);
    const isBlunt = exception ?? (isWeaponBlunt || isGeo);
    addKitCandidate(candidateMap, `${hitPath}.isBlunt`, {
      provenance: { rule: KitRule.Blunt, source: KitSource.Rule },
      value: isBlunt,
    });
    if (!isBlunt && ownElement === undefined && isGauged && element === Element.Geo)
      addKitCandidate(candidateMap, `${hitPath}.element`, {
        provenance: { rule: KitRule.NonBluntGeoElement, source: KitSource.Rule },
        value: Element.Geo,
      });
  }
  return candidateMap;
};
