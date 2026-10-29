<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";
import type { GenshinSave } from "genshin-world/save";

import {
  GENSHIN_ACCOUNT_CHARACTER_PACK_FILE_BASE_URL,
  GENSHIN_CHARACTER_PACK_BASE_URL,
  GENSHIN_REGION_DATA_BASE_URL,
  GENSHIN_SCENE_EXPORT_BASE_URL,
} from "#shared/services/genshin/constants";
import { getGenshinGameDataBaseUrl } from "#shared/services/genshin/getGenshinGameDataBaseUrl";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { GENSHIN_QUALITY_TIER } from "@/services/genshin/constants";
import { GENSHIN_DEV_COMMAND_GROUP } from "@/services/genshin/dev/constants";
import { RoutePath } from "@esposter/shared";
import { createDevRegistry, exposeDevRegistry, WorldScreen } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused: boolean;
  // The reader's game language, whose names the world loads
  language: GameLanguage;
  // The player's save the world starts from, and the server's clock minus this machine's, which its timers are read by
  save: GenshinSave;
  serverClockOffsetMs: number;
}

const { gameText, isPaused, language, save, serverClockOffsetMs } = defineProps<Props>();
const emit = defineEmits<{ grant: []; load: []; ready: []; save: [save: GenshinSave] }>();
const containerBaseUrl = useContainerBaseUrl();
const { accountCharacterPacks, isSignedIn, keepAccountCharacterPack, removeAccountCharacterPack } =
  useAccountCharacterPacks();
// The signed-in player's picture and name, which the world's profile card shows
const session = authClient.useSession();
// The world's screen with what only the app can hand it: the terrain worker its bundler builds, the URLs its server
// Serves region data at, in development alone the developer's own character packs, exports of the game's scenes and
// The developer registry; quitting the game leaves for the app's home
// The developer registry is made in development alone, and the world's commands and variables register with it. A
// Browser driven by automation takes it through `window.__dev` and mounts no surface, since a panel would cover the
// Scene it shoots; a player's build has neither
const devRegistry = IS_DEVELOPMENT ? createDevRegistry() : undefined;
const isDevSurfaceShown = ref(false);
const isDevConsoleOpen = ref(false);
const isDevPanelOpen = ref(false);
useCommands(() =>
  isDevSurfaceShown.value
    ? [
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "open-dev-console",
          meaning: UiIconMeaning.Command,
          run: () => {
            isDevConsoleOpen.value = true;
          },
          shortcut: "`",
          title: "Open the developer console",
        },
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "toggle-dev-panel",
          meaning: UiIconMeaning.Settings,
          run: () => {
            isDevPanelOpen.value = !isDevPanelOpen.value;
          },
          shortcut: "f2",
          title: "Show or hide the developer panel",
        },
      ]
    : [],
);
onMounted(() => {
  emit("load");
  if (!devRegistry) return;
  if (window.navigator.webdriver) exposeDevRegistry(devRegistry, window);
  else isDevSurfaceShown.value = true;
});
</script>

<template>
  <WorldScreen
    :account-avatar-url="session.data?.user.image ?? ''"
    :account-character-packs="accountCharacterPacks ?? []"
    :account-file-base-url="isSignedIn ? GENSHIN_ACCOUNT_CHARACTER_PACK_FILE_BASE_URL : ''"
    :account-name="session.data?.user.name"
    :character-pack-base-url="IS_DEVELOPMENT ? GENSHIN_CHARACTER_PACK_BASE_URL : ''"
    :create-terrain-worker="() => new TerrainTileWorker()"
    :dev-registry="devRegistry"
    :game-data-base-url="getGenshinGameDataBaseUrl(containerBaseUrl)"
    :game-text
    :is-paused
    :is-tuning="IS_DEVELOPMENT"
    :keep-account-character-pack="isSignedIn ? keepAccountCharacterPack : undefined"
    :language
    :quality-tier="GENSHIN_QUALITY_TIER"
    :remove-account-character-pack="isSignedIn ? removeAccountCharacterPack : undefined"
    :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
    :save
    :scene-export-base-url="IS_DEVELOPMENT ? GENSHIN_SCENE_EXPORT_BASE_URL : ''"
    :server-clock-offset-ms
    @grant="emit('grant')"
    @quit="navigateTo(RoutePath.Index)"
    @ready="emit('ready')"
    @save="(newSave) => emit('save', newSave)"
  />
  <template v-if="devRegistry && isDevSurfaceShown">
    <GenshinDevConsole v-model="isDevConsoleOpen" :registry="devRegistry" />
    <GenshinDevPanel v-model="isDevPanelOpen" :registry="devRegistry" />
  </template>
</template>
