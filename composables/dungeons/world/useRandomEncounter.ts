import { EncounterObjectProperty } from "@/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { findTiledObjectProperty } from "@/services/dungeons/tilemap/findTiledObjectProperty";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/world/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

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

  const worldSceneStore = useWorldSceneStore();
  const { encounterLayer } = storeToRefs(worldSceneStore);
  const areaTiledObjectProperty = findTiledObjectProperty<Area>(
    encounterLayer.value.layer.properties,
    EncounterObjectProperty.area,
  );
  if (!areaTiledObjectProperty) return;

  console.log(areaTiledObjectProperty);
  stepsSinceLastEncounter.value = 0;
  fadeSwitchToScene(SceneKey.Battle, 2000);
};
