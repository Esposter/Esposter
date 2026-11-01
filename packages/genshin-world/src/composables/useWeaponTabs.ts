import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import { getWeaponActions } from "#src/services/weapon/getWeaponActions";
import { getWeaponData } from "#src/services/weapon/getWeaponData";
import { WeaponMenuTab } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { computed, toValue } from "vue";

// The tabs a weapon offers and the one its body draws, which the parent's tab model asks for while the weapon still offers it
export const useWeaponTabs = (
  tab: Ref<WeaponMenuTab>,
  weapon: ComputedRef<Weapon>,
  weaponDataMap: MaybeRefOrGetter<ReadonlyMap<number, WeaponData>>,
  gameText: MaybeRefOrGetter<GameText>,
) => {
  // The tabs a weapon offers: Ascend at its phase's cap and Enhance below it, and Refine where its rank can still rise
  const getOfferedTabs = (target: Weapon): WeaponMenuTab[] => {
    const { canAscend, canRefine } = getWeaponActions(target, getWeaponData(toValue(weaponDataMap), target.id));
    return [canAscend ? WeaponMenuTab.Ascend : WeaponMenuTab.Enhance, ...(canRefine ? [WeaponMenuTab.Refine] : [])];
  };
  const offeredTabs = computed(() => getOfferedTabs(weapon.value));
  // The tab the body draws: the one asked for while the weapon still offers it, else the first it offers, so a weapon that
  // Levels to its cap leaves Enhance for Ascend without the parent changing the tab
  const openTab = computed({
    get: () => (offeredTabs.value.includes(tab.value) ? tab.value : (offeredTabs.value[0] ?? WeaponMenuTab.Enhance)),
    set: (value: WeaponMenuTab) => {
      tab.value = value;
    },
  });
  const tabLabels = computed((): Record<WeaponMenuTab, string> => {
    const text = toValue(gameText);
    return {
      [WeaponMenuTab.Ascend]: text[GameTextKey.WeaponAscend],
      [WeaponMenuTab.Enhance]: text[GameTextKey.WeaponEnhance],
      [WeaponMenuTab.Refine]: text[GameTextKey.WeaponRefine],
    };
  });
  const menuTabs = computed(() =>
    offeredTabs.value.map((menuTab) => ({ label: tabLabels.value[menuTab], tab: menuTab })),
  );
  return { menuTabs, openTab, tabLabels };
};
