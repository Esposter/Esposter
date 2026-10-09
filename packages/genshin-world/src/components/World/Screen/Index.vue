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
import { getResultAsync } from "@esposter/shared";

// The world, opened once the names and the game's tables it reads its save and runs its rules by have arrived. The
// Bag's weapons, materials and names are read as the save loads, so the world is made only then. A table that fails to
// Arrive is logged and the world stays shut, ready all the same, as a world that cannot start is, so a host waiting on it
// Moves on
const props = defineProps<WorldScreenProps>();
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
const tables = shallowRef<WorldTables>();
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() =>
  Promise.all([
    NameTextLoaderMap[props.language](props.gameDataBaseUrl),
    readStatTables(props.gameDataBaseUrl),
    readEnemyTables(props.gameDataBaseUrl),
    readAdventureRankTables(props.gameDataBaseUrl),
    readMaterialDataMap(props.gameDataBaseUrl),
    readHudInterfaceRects(props.gameDataBaseUrl),
  ]),
).match(
  ([nameText, statTables, enemyTables, adventureRankTables, materialDataMap, hudInterfaceRects]) => {
    tables.value = { adventureRankTables, enemyTables, hudInterfaceRects, materialDataMap, nameText, statTables };
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
