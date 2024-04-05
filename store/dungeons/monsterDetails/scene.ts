import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ATTACK_DISPLAY_LIMIT } from "@/services/dungeons/attack/constants";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMonsterDetailsSceneStore = defineStore("dungeons/monsterDetails/scene", () => {
  const phaserStore = usePhaserStore();
  const { removeParallelScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const monsterIndex = ref(0);
  const monster = computed(() => save.value.player.monsters[monsterIndex.value]);
  const attacks = computed(() => {
    const attacks: Attack[] = [];
    for (const attackId of monster.value.attackIds) {
      const attack = getAttack(attackId);
      if (!attack) continue;
      attacks.push(attack);
    }
    return attacks;
  });
  const attackNames = computed(() => attacks.value.slice(0, ATTACK_DISPLAY_LIMIT).map((a) => a.name));
  const previousSceneKey = ref<SceneKey | null>(null);

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

  const switchToPreviousScene = () => {
    if (!previousSceneKey.value) return;
    removeParallelScene(SceneKey.MonsterDetails);
    scene.value.scene.resume(previousSceneKey.value);
    previousSceneKey.value = null;
  };

  return {
    monsterIndex,
    monster,
    attackNames,
    previousSceneKey,
    onPlayerInput,
  };
});
