import type { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import type { SceneWithPlugins } from "vue-phaserjs";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { EncounterObjectProperty } from "#shared/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { getEncounterArea } from "#src/services/dungeons/area/getEncounterArea";
import { createEncounteredMonster } from "#src/services/dungeons/monster/createEncounteredMonster";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "#src/services/dungeons/scene/world/constants";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useEncounterStore } from "#src/store/dungeons/world/encounter";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { createRandomBoolean } from "#src/util/math/random/createRandomBoolean";
import { getWeightedRandomValue } from "#src/util/math/random/getWeightedRandomValue";
import { NotFoundError } from "@esposter/shared";

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
  const { layerMap } = storeToRefs(worldSceneStore);
  const properties = layerMap.value?.get(LayerName.Encounter)?.layer.properties;
  if (!properties) throw new NotFoundError(useRandomEncounter.name, LayerName.Encounter);

  const areaTiledObjectProperty = getTiledObjectProperty<Area>(properties, EncounterObjectProperty.Area);
  const encounterArea = getEncounterArea(areaTiledObjectProperty.value);
  const randomEncounterableMonster = getWeightedRandomValue(encounterArea.encounterableMonsters);
  const randomMonster = createEncounteredMonster(randomEncounterableMonster.key, randomEncounterableMonster.level);
  const enemyStore = useEnemyStore();
  const { activeMonster } = storeToRefs(enemyStore);
  stepsSinceLastEncounter.value = 0;
  activeMonster.value = randomMonster;
  fadeSwitchToScene(scene, SceneKey.Battle, Temporal.Duration.from({ seconds: 2 }).total("milliseconds"));
};
