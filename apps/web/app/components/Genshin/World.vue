<script setup lang="ts">
import { GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { GENSHIN_QUALITY_TIER } from "@/services/genshin/constants";
import { WorldScreen } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";

interface Props {
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
}

const { isPaused } = defineProps<Props>();
const emit = defineEmits<{ load: []; ready: [] }>();
// The world's screen with what only the app can hand it: the terrain worker its bundler builds, the URL its server
// Serves region data at, and whether the tuning panel shows
onMounted(() => {
  emit("load");
});
</script>

<template>
  <WorldScreen
    :create-terrain-worker="() => new TerrainTileWorker()"
    :is-paused
    :is-tuning="IS_DEVELOPMENT || undefined"
    :quality-tier="GENSHIN_QUALITY_TIER"
    :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
    @ready="emit('ready')"
  />
</template>
