import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { ATTACK_DISPLAY_LIMIT } from "@/services/dungeons/attack/constants";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { exhaustiveGuard } from "@esposter/shared";

export const useMonsterDetailsSceneStore = defineStore("dungeons/monsterDetails/scene", () => {
  const selectedMonster = ref<Monster>();
  const attacks = computed(() => selectedMonster.value?.attackIds.map(getAttack) ?? []);
  const attackNames = computed(() => attacks.value.slice(0, ATTACK_DISPLAY_LIMIT).map(({ id }) => id));
  const { switchToPreviousScene } = usePreviousScene(SceneKey.MonsterDetails);

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
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

  return {
    attackNames,
    onPlayerInput,
    selectedMonster: selectedMonster as Ref<Monster>,
  };
});
