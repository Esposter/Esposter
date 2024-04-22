import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { ATTACK_DISPLAY_LIMIT } from "@/services/dungeons/attack/constants";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { usePlayerStore } from "@/store/dungeons/player";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMonsterDetailsSceneStore = defineStore("dungeons/monsterDetails/scene", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const monsterIndex = ref(0);
  const monster = computed(() => player.value.monsters[monsterIndex.value]);
  const attacks = computed(() => monster.value.attackIds.map(getAttack));
  const attackNames = computed(() => attacks.value.slice(0, ATTACK_DISPLAY_LIMIT).map((a) => a.name));
  const { switchToPreviousScene } = usePreviousScene(SceneKey.MonsterDetails);

  const onPlayerInput = (justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
      case PlayerSpecialInput.Cancel:
        switchToPreviousScene();
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  return {
    monsterIndex,
    monster,
    attackNames,
    onPlayerInput,
  };
});
