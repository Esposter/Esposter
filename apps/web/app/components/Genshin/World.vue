<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";
import type { DevRegistry } from "genshin-world";
import type { GenshinSave } from "genshin-world/save";

import { GENSHIN_REGION_DATA_BASE_URL, GENSHIN_SCENE_EXPORT_BASE_URL } from "#shared/services/genshin/constants";
import { getGenshinGameDataBaseUrl } from "#shared/services/genshin/getGenshinGameDataBaseUrl";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { authClient } from "@/services/auth/authClient";
import { GENSHIN_QUALITY_TIER } from "@/services/genshin/constants";
import { RoutePath } from "@esposter/shared";
import { WorldScreen } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the world's session is held back, its tables read all the same, until the door of the opening is opened
  isHeld: boolean;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused: boolean;
  // The reader's game language, whose names the world loads
  language: GameLanguage;
  // The player's save the world starts from, and the server's clock minus this machine's, which its timers are read by
  save: GenshinSave;
  serverClockOffsetMs: number;
}

const { gameText, isHeld, isPaused, language, save, serverClockOffsetMs } = defineProps<Props>();
const emit = defineEmits<{ grant: []; load: []; ready: []; save: [save: GenshinSave] }>();
const containerBaseUrl = useContainerBaseUrl();
const gameDataBaseUrl = getGenshinGameDataBaseUrl(containerBaseUrl);
// The signed-in player's picture and name, which the world's profile card shows
const session = authClient.useSession();
// The developer surface sits in a DevOnly block of the template, which a production build strips out, and its registry is
// handed up before the world mounts, so the world waits for it in development
const devRegistry = shallowRef<DevRegistry>();
const isWorldReady = computed(() => !IS_DEVELOPMENT || devRegistry.value !== undefined);
// The save the world last wrote, which the developer's save commands read. A change they make is handed back to the page
// As the world's own save and applied by a reload, since a running world reads its save once, when it starts
const latestSave = shallowRef(save);
const saveWorld = (newSave: GenshinSave) => {
  latestSave.value = newSave;
  emit("save", newSave);
};
const applyDevSave = (newSave: GenshinSave) => {
  saveWorld(newSave);
  window.location.reload();
};
onMounted(() => {
  emit("load");
});
</script>

<template>
  <WorldScreen
    v-if="isWorldReady"
    :account-avatar-url="session.data?.user.image || ''"
    :account-name="session.data?.user.name || ''"
    :create-terrain-worker="() => new TerrainTileWorker()"
    :dev-registry
    :game-data-base-url
    :game-text
    :is-held
    :is-paused
    :is-tuning="IS_DEVELOPMENT"
    :language
    :quality-tier="GENSHIN_QUALITY_TIER"
    :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
    :save
    :scene-export-base-url="IS_DEVELOPMENT ? GENSHIN_SCENE_EXPORT_BASE_URL : ''"
    :server-clock-offset-ms
    @grant="emit('grant')"
    @quit="navigateTo(RoutePath.Index)"
    @ready="emit('ready')"
    @save="(newSave) => saveWorld(newSave)"
  />
  <DevOnly>
    <GenshinDev
      :apply-save="applyDevSave"
      :game-data-base-url
      :game-text
      :get-save="() => latestSave"
      :language
      @registry="devRegistry = $event"
    />
  </DevOnly>
</template>
