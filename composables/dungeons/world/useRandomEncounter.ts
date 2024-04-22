import { EncounterObjectProperty } from "@/generated/tiled/propertyTypes/class/EncounterObjectProperty";
import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { Monster } from "@/models/dungeons/monster/Monster";
import { getEncounterArea } from "@/services/dungeons/area/getEncounterArea";
import { MAX_STEPS_BEFORE_NEXT_ENCOUNTER } from "@/services/dungeons/scene/world/constants";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { generateRandomBoolean } from "@/util/math/random/generateRandomBoolean";
import { pickRandomValue } from "@/util/math/random/pickRandomValue";

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
  const isEncounter = generateRandomBoolean(encounterChance);
  if (!isEncounter) return;

  const enemyStore = useEnemyStore();
  const { activeMonster } = storeToRefs(enemyStore);
  const worldSceneStore = useWorldSceneStore();
  const { encounterLayer } = storeToRefs(worldSceneStore);
  const areaTiledObjectProperty = getTiledObjectProperty<Area>(
    encounterLayer.value.layer.properties,
    EncounterObjectProperty.area,
  );
  const encounterArea = getEncounterArea(areaTiledObjectProperty.value);
  const randomMonsterKey = pickRandomValue(encounterArea.monsterKeys);
  const randomMonster = new Monster(randomMonsterKey);
  stepsSinceLastEncounter.value = 0;
  activeMonster.value = randomMonster;
  fadeSwitchToScene(SceneKey.Battle, 2000);
};
