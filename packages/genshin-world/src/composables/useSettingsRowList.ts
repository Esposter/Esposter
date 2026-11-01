import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { QualityTier } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { GRAPHICS_QUALITY_TIERS } from "#src/services/menu/constants";
import { QualityTierGameTextKeyMap } from "#src/services/menu/QualityTierGameTextKeyMap";
import { fillGameTextValues, GameLanguages, GameTextKey, getLanguageDisplayName } from "genshin-text";
import { computed, watch } from "vue";

// The Graphics Quality and Game Language rows each open a list, one at a time, and a change of tab closes it
export const useSettingsRowList = (
  settings: Ref<GenshinSettings>,
  tab: Ref<SettingsTab>,
  openedList: Ref<SettingsRowKind | undefined>,
  shownGameText: ComputedRef<GameText>,
  defaultQualityTier: () => QualityTier,
) => {
  watch(tab, () => {
    openedList.value = undefined;
  });
  const getQualityTierWords = (qualityTier: QualityTier): string => {
    const words = shownGameText.value[QualityTierGameTextKeyMap[qualityTier]];
    return qualityTier === defaultQualityTier()
      ? fillGameTextValues(shownGameText.value[GameTextKey.SettingsDefault], words)
      : words;
  };
  const qualityValue = computed(() => getQualityTierWords(settings.value.qualityTier));
  // The options the open list offers, each with whether it is the setting now and the choice that sets it
  const openedOptions = computed(() => {
    if (openedList.value === SettingsRowKind.Language)
      return GameLanguages.map((gameLanguage) => ({
        choose: () => {
          settings.value = { ...settings.value, language: gameLanguage };
          openedList.value = undefined;
        },
        isSelected: gameLanguage === settings.value.language,
        label: getLanguageDisplayName(gameLanguage, gameLanguage),
      }));
    if (openedList.value === SettingsRowKind.Quality)
      return GRAPHICS_QUALITY_TIERS.map((qualityTier) => ({
        choose: () => {
          settings.value = { ...settings.value, qualityTier };
          openedList.value = undefined;
        },
        isSelected: qualityTier === settings.value.qualityTier,
        label: getQualityTierWords(qualityTier),
      }));
    return [];
  });
  return { openedOptions, qualityValue };
};
