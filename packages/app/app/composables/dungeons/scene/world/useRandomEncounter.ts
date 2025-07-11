import type { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import type { SceneWithPlugins } from "vue-phaserjs";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { EncounterObjectProperty } from "#shared/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { getEncounterArea } from "@/services/dungeons/area/getEncounterArea";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/scene/world/constants";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useDungeonsStore } from "@/store/dungeons";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
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
  const isEncounter = createRandomBoolean(encounterChance);
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
