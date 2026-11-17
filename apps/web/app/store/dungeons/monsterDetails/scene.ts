import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { ATTACK_DISPLAY_LIMIT } from "#src/services/dungeons/attack/constants";
import { getAttack } from "#src/services/dungeons/attack/getAttack";
import { transitionFrom } from "#src/services/dungeons/scene/transitionFrom";
import { checkIsPlayerSpecialInput } from "#src/services/dungeons/UI/input/checkIsPlayerSpecialInput";
import { exhaustiveGuard } from "@esposter/shared";

export const useMonsterDetailsSceneStore = defineStore("dungeons/monsterDetails/scene", () => {
  const selectedMonster = ref<Monster>();
  const attackNames = computed(() =>
    (selectedMonster.value?.attackIds.map((attackId) => getAttack(attackId)) ?? [])
      .slice(0, ATTACK_DISPLAY_LIMIT)
      .map(({ id }) => id),
  );
  const { switchToPreviousScene } = transitionFrom(SceneKey.MonsterDetails);

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (checkIsPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
      case PlayerSpecialInput.Confirm:
        switchToPreviousScene(scene);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  return { attackNames, onPlayerInput, selectedMonster: selectedMonster as Ref<Monster> };
});
