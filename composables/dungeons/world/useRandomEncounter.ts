import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/world/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";

export const useRandomEncounter = () => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene } = gameStore;
  const settingsStore = useSettingsStore();
  const { isSkipEncounters } = storeToRefs(settingsStore);
  if (isSkipEncounters.value) return;

  const encounterStore = useEncounterStore();
  const { stepsSinceLastEncounter } = storeToRefs(encounterStore);
  stepsSinceLastEncounter.value++;

  const encounterChance = stepsSinceLastEncounter.value / MAX_STEPS_BEFORE_NEXT_ENCOUNTER;
  const isEncounter = Math.random() < encounterChance;
  if (!isEncounter) return;

  stepsSinceLastEncounter.value = 0;
  fadeSwitchToScene(SceneKey.Battle, 2000);
};
