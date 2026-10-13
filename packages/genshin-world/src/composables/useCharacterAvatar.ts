import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";
import type { CharacterMaterialOptions } from "genshin-engine";

import { AVATAR_COMPONENT } from "#src/services/character/avatar/constants";
import { disposeCharacterAvatar } from "#src/services/character/avatar/disposeCharacterAvatar";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readSceneExportComponents } from "#src/services/scene/readSceneExportComponents";
import { getResultAsync } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";

// The Traveler's game model, read from the developer's exports in development when the export index holds it, and drawn in
// Place of the pack's while the Traveler is the character on the field. Read once, on the first time the Traveler is, and
// Released with the scene. With no host, or an index without it, nothing is read and the pack draws the character
export const useCharacterAvatar = (
  sceneExportBaseUrl: string | undefined,
  getCharacterId: () => number,
  options: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
) => {
  const characterAvatar = shallowRef<CharacterAvatar>();
  const drawnAvatar = computed(() => (getCharacterId() === TRAVELER_CHARACTER_ID ? characterAvatar.value : undefined));
  let isRequested = false;
  let isUnmounted = false;
  const request = (): void => {
    if (!sceneExportBaseUrl || isRequested || getCharacterId() !== TRAVELER_CHARACTER_ID) return;
    isRequested = true;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    readSceneExportComponents(sceneExportBaseUrl).match(
      (components) => {
        if (!components.includes(AVATAR_COMPONENT)) return;
        // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
        getResultAsync(async () =>
          // eslint-disable-next-line no-restricted-syntax -- the avatar builder loads on the first traveler avatar request, keeping it out of the world's eager graph
          (await import("#src/services/character/avatar/readCharacterAvatar")).readCharacterAvatar(
            `${sceneExportBaseUrl}/${AVATAR_COMPONENT}`,
            options,
          ),
        ).match(
          (avatar) => {
            if (isUnmounted) disposeCharacterAvatar(avatar);
            else characterAvatar.value = avatar;
          },
          (error) => {
            console.error(error);
          },
        );
      },
      (error) => {
        console.error(error);
      },
    );
  };
  watchImmediate(getCharacterId, request);
  onUnmounted(() => {
    isUnmounted = true;
    if (characterAvatar.value) disposeCharacterAvatar(characterAvatar.value);
    characterAvatar.value = undefined;
  });
  return drawnAvatar;
};
