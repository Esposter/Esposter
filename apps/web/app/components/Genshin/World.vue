<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GENSHIN_CHARACTER_PACK_PATH, GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { GENSHIN_QUALITY_TIER } from "@/services/genshin/constants";
import { AzureContainer } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { WorldScreen } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
}

const { gameText, isPaused } = defineProps<Props>();
const emit = defineEmits<{ load: []; ready: [] }>();
const containerBaseUrl = useContainerBaseUrl();
// The world's screen with what only the app can hand it: the terrain worker its bundler builds, the URL its server
// Serves region data at, where its storage keeps the characters' packs, and whether the tuning panel shows; quitting
// The game leaves for the app's home
onMounted(() => {
  emit("load");
});
</script>

<template>
  <WorldScreen
    :character-pack-base-url="`${containerBaseUrl}/${AzureContainer.AppAssets}/${GENSHIN_CHARACTER_PACK_PATH}`"
    :create-terrain-worker="() => new TerrainTileWorker()"
    :game-text
    :is-paused
    :is-tuning="IS_DEVELOPMENT || undefined"
    :quality-tier="GENSHIN_QUALITY_TIER"
    :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
    @quit="navigateTo(RoutePath.Index)"
    @ready="emit('ready')"
  />
</template>
