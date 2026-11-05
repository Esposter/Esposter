import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";
import type { ComputedRef, MaybeRefOrGetter } from "vue";

import { Attribute } from "#src/models/character/Attribute";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";
import { getAttributeLabel } from "#src/services/character/getAttributeLabel";
import { getSecondaryAttribute } from "#src/services/character/getSecondaryAttribute";
import { getWeaponAttributeTotals } from "#src/services/weapon/getWeaponAttributeTotals";
import { computed, toValue } from "vue";

// The attribute texts the Enhance and Ascend tabs both draw, read from the weapon at its level and phase
export const useWeaponStats = (
  weapon: ComputedRef<Weapon>,
  weaponData: ComputedRef<WeaponData>,
  weaponGrowCurveMap: MaybeRefOrGetter<ReadonlyMap<string, readonly number[]>>,
  gameText: MaybeRefOrGetter<GameText>,
) => {
  const getAttributeTotals = (ascension: number) =>
    getWeaponAttributeTotals(weaponData.value, toValue(weaponGrowCurveMap), weapon.value.level, ascension);
  // The base ATK at the held phase and at the next one, which the Ascend row sets side by side
  const getBaseAttackText = (ascension: number) =>
    formatWholeNumber(getAttributeTotals(ascension)[Attribute.BaseAttack]);
  const baseAttackText = computed(() => getBaseAttackText(weapon.value.ascension));
  const nextBaseAttackText = computed(() => getBaseAttackText(weapon.value.ascension + 1));
  // The secondary attribute the weapon grows beside its base ATK, at the held phase, written whole or as a percentage by its
  // Kind; a secondary the label map names no caption for leaves its caption undrawn
  const secondaryAttribute = computed(() => getSecondaryAttribute(weaponData.value));
  const secondaryText = computed(() =>
    secondaryAttribute.value === undefined
      ? ""
      : formatAttributeValue(
          secondaryAttribute.value,
          getAttributeTotals(weapon.value.ascension)[secondaryAttribute.value],
        ),
  );
  const secondaryLabel = computed(() => getAttributeLabel(secondaryAttribute.value, toValue(gameText)));
  return { baseAttackText, nextBaseAttackText, secondaryLabel, secondaryText };
};
