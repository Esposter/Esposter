<script setup lang="ts">
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";
import type { WorldTables } from "#src/models/world/WorldTables";

import WorldSession from "#src/components/World/Session/Index.vue";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readHudInterfaceRects } from "#src/services/hud/readHudInterfaceRects";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { readMondstadtFrostbearingTreePlaces } from "#src/services/offering/readMondstadtFrostbearingTreePlaces";
import { STARTING_TEAM_CHARACTER_IDS } from "#src/services/party/constants";
import { readMondstadtWildlifePlaces } from "#src/services/wildlife/readMondstadtWildlifePlaces";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { readWishSchedule } from "#src/services/wish/readWishSchedule";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { getResultAsync } from "@esposter/shared";

// The world, opened once the names and the game's tables it reads its save and runs its rules by have arrived, with the
// Starting team's kits its first frame builds their combatants from, and the ground, the catalogue and the animals its
// First frame draws. The bag's weapons, materials and names are read as the save loads, so the world is made only then.
// A record that fails to arrive is logged and the world stays shut, ready all the same, as a world that cannot start
// Is, so a host waiting on it moves on
const props = defineProps<WorldScreenProps>();
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
const tables = shallowRef<WorldTables>();
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() =>
  measureLoadStep(
    "world-gate",
    Promise.all([
      measureLoadStep("name-text", NameTextLoaderMap[props.language](props.gameDataBaseUrl)),
      measureLoadStep("stat-tables", readStatTables(props.gameDataBaseUrl)),
      measureLoadStep("enemy-tables", readEnemyTables(props.gameDataBaseUrl)),
      measureLoadStep("adventure-rank-tables", readAdventureRankTables(props.gameDataBaseUrl)),
      measureLoadStep("material-data-map", readMaterialDataMap(props.gameDataBaseUrl)),
      measureLoadStep("hud-interface-rects", readHudInterfaceRects(props.gameDataBaseUrl)),
      measureLoadStep("character-kits", readCharacterKits(props.gameDataBaseUrl, STARTING_TEAM_CHARACTER_IDS)),
      measureLoadStep("windrise-data", readWindriseData(props.gameDataBaseUrl)),
      measureLoadStep("catalogue", readCatalogue(props.gameDataBaseUrl)),
      measureLoadStep("wildlife-places", readMondstadtWildlifePlaces(props.gameDataBaseUrl)),
      measureLoadStep("frostbearing-tree-places", readMondstadtFrostbearingTreePlaces(props.gameDataBaseUrl)),
      measureLoadStep("wish-schedule", readWishSchedule(props.gameDataBaseUrl)),
    ]),
  ),
).match(
  ([
    nameText,
    statTables,
    enemyTables,
    adventureRankTables,
    materialDataMap,
    hudInterfaceRects,
    startingCharacterIdKitMap,
    windriseData,
    catalogue,
    wildlifePlaces,
    frostbearingTreePlaces,
    wishSchedule,
  ]) => {
    tables.value = {
      adventureRankTables,
      catalogue,
      enemyTables,
      frostbearingTreePlaces,
      hudInterfaceRects,
      materialDataMap,
      nameText,
      startingCharacterIdKitMap,
      statTables,
      wildlifePlaces,
      windriseData,
      wishSchedule,
    };
  },
  (error) => {
    console.error(error);
    emit("ready");
  },
);
</script>

<template>
  <WorldSession
    v-if="tables"
    :="{ ...props, ...tables }"
    @grant="emit('grant')"
    @quit="emit('quit')"
    @ready="emit('ready')"
    @save="(newSave) => emit('save', newSave)"
  />
</template>
