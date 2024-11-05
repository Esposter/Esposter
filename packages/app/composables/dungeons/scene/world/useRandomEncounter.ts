import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { SceneWithPlugins } from "vue-phaserjs";

import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { EncounterObjectProperty } from "@/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { Monster } from "@/models/dungeons/monster/Monster";
import { getEncounterArea } from "@/services/dungeons/area/getEncounterArea";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/scene/world/constants";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useDungeonsStore } from "@/store/dungeons";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";
import { getWeightedRandomValue } from "@/util/math/random/getWeightedRandomValues";

export const useRandomEncounter = (scene: SceneWithPlugins) => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const settingsStore = useSettingsStore();
  const { isSkipEncounters } = storeToRefs(settingsStore);
  if (isSkipEncounters.value) return;

  const encounterStore = useEncounterStore();
  const { stepsSinceLastEncounter } = storeToRefs(encounterStore);
  stepsSinceLastEncounter.value++;

  const encounterChance = stepsSinceLastEncounter.value / MAX_STEPS_BEFORE_NEXT_ENCOUNTER;
  const isEncounter = generateRandomBoolean(encounterChance);
  if (!isEncounter) return;

  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey } = storeToRefs(worldSceneStore);
  const properties = ExternalWorldSceneStore.tilemapKeyLayerMap.get(tilemapKey.value)?.get(LayerName.Encounter)
    ?.layer.properties;
  if (!properties) return;

  const areaTiledObjectProperty = getTiledObjectProperty<Area>(properties, EncounterObjectProperty.area);
  const encounterArea = getEncounterArea(areaTiledObjectProperty.value);
  const randomEncounterableMonster = getWeightedRandomValue(encounterArea.encounterableMonsters);
  const randomMonster = new Monster(randomEncounterableMonster.key);
  const enemyStore = useEnemyStore();
  const { activeMonster } = storeToRefs(enemyStore);
  stepsSinceLastEncounter.value = 0;
  activeMonster.value = randomMonster;
  fadeSwitchToScene(scene, SceneKey.Battle, 2000);
};
