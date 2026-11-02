import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { GameLanguage, GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { getResultAsync } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";
import { GameTextLoaderMap } from "genshin-text";
import { computed, shallowRef } from "vue";

// The labels show the words of the language chosen here. The reader's own language's are the game text given, and any
// Other is its chunk, loaded when it is chosen and kept only if it is still the choice when it arrives
export const useSettingsGameText = (
  settings: Ref<GenshinSettings>,
  language: () => GameLanguage,
  gameText: () => GameText,
): ComputedRef<GameText> => {
  const chosenGameText = shallowRef<GameText>();
  watchImmediate(
    () => settings.value.language,
    (newLanguage) => {
      if (newLanguage === language()) {
        chosenGameText.value = undefined;
        return;
      }

      getResultAsync(() => GameTextLoaderMap[newLanguage]()).match(
        (loadedGameText) => {
          if (settings.value.language === newLanguage) chosenGameText.value = loadedGameText;
        },
        (error) => {
          console.error(error);
        },
      );
    },
  );
  return computed(() => chosenGameText.value ?? gameText());
};
