import { EncounterObjectProperty } from "@/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getEncounterArea } from "@/services/dungeons/area/getEncounterArea";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/scene/world/constants";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";
import { pickWeightedRandomValue } from "@/util/math/random/pickWeightedRandomValues";

export const useRandomEncounter = (scene: SceneWithPlugins) => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene } = gameStore;
  const settingsStore = useSettingsStore();
  const { isSkipEncounters } = storeToRefs(settingsStore);
  if (isSkipEncounters.value) return;

  const encounterStore = useEncounterStore();
  const { stepsSinceLastEncounter } = storeToRefs(encounterStore);
  stepsSinceLastEncounter.value++;

  const encounterChance = stepsSinceLastEncounter.value / MAX_STEPS_BEFORE_NEXT_ENCOUNTER;
  const isEncounter = generateRandomBoolean(encounterChance);
  if (!isEncounter) return;

  const enemyStore = useEnemyStore();
  const { activeMonster } = storeToRefs(enemyStore);
  const areaTiledObjectProperty = getTiledObjectProperty<Area>(
    ExternalWorldSceneStore.encounterLayer.layer.properties,
    EncounterObjectProperty.area,
  );
  const encounterArea = getEncounterArea(areaTiledObjectProperty.value);
  const randomEncounterableMonster = pickWeightedRandomValue(encounterArea.encounterableMonsters);
  const randomMonster = new Monster(randomEncounterableMonster.key);
  stepsSinceLastEncounter.value = 0;
  activeMonster.value = randomMonster;
  fadeSwitchToScene(scene, SceneKey.Battle, 2000);
};
