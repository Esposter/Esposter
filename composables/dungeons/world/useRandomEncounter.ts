import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { dayjs } from "@/services/dayjs";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/world/constants";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { Cameras } from "phaser";

export const useRandomEncounter = () => {
  const settingsStore = useSettingsStore();
  const { isSkipEncounters } = storeToRefs(settingsStore);
  if (isSkipEncounters.value) return;

  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
  const battleSceneStore = useBattleSceneStore();
  const { initialize } = battleSceneStore;
  const encounterStore = useEncounterStore();
  const { stepsSinceLastEncounter, isMonsterEncountered } = storeToRefs(encounterStore);
  stepsSinceLastEncounter.value++;

  const encounterChance = stepsSinceLastEncounter.value / MAX_STEPS_BEFORE_NEXT_ENCOUNTER;
  const isEncounter = Math.random() < encounterChance;
  if (!isEncounter) return;

  isMonsterEncountered.value = true;
  stepsSinceLastEncounter.value = 0;
  scene.value.cameras.main.fadeOut(dayjs.duration(2, "seconds").asMilliseconds());
  scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    initialize();
    switchToScene(SceneKey.Battle);
    isMonsterEncountered.value = false;
  });
};
