<script setup lang="ts">
import type { StatTables } from "#src/models/character/StatTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { WorldScreenProps } from "#src/models/world/WorldScreenProps";

import WorldSession from "#src/components/World/Session/Index.vue";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { getResultAsync } from "@esposter/shared";

// The world, opened once the names and the stat tables it reads its save by have arrived. The bag's weapons and names are
// Read as the save loads, so the world is made only then. A table that fails to arrive is logged and the world stays shut,
// Ready all the same, as a world that cannot start is, so a host waiting on it moves on
const props = defineProps<WorldScreenProps>();
const emit = defineEmits<{ grant: []; quit: []; ready: []; save: [save: GenshinSave] }>();
const loaded = shallowRef<{ nameText: Readonly<Record<string, string>>; statTables: StatTables }>();
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => Promise.all([NameTextLoaderMap[props.language](), readStatTables()])).match(
  ([nameText, statTables]) => {
    loaded.value = { nameText, statTables };
  },
  (error) => {
    console.error(error);
    emit("ready");
  },
);
</script>

<template>
  <WorldSession
    v-if="loaded"
    :="props"
    :name-text="loaded.nameText"
    :stat-tables="loaded.statTables"
    @grant="emit('grant')"
    @quit="emit('quit')"
    @ready="emit('ready')"
    @save="(newSave) => emit('save', newSave)"
  />
</template>
