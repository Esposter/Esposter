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
import { useAccountCharacterPacks } from "@/composables/genshin/useAccountCharacterPacks";
import { authClient } from "@/services/auth/authClient";
import { GENSHIN_QUALITY_TIER } from "@/services/genshin/constants";
import { RoutePath } from "@esposter/shared";
import { WorldScreen } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
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
// Serves region data at and, in development alone, the developer's own character packs and exports of the game's
// Scenes, and whether the tuning panel shows; quitting the game leaves for the app's home
onMounted(() => {
  emit("load");
});
</script>

<template>
  <WorldScreen
    :account-avatar-url="session.data?.user.image ?? undefined"
    :account-character-packs
    :account-file-base-url="isSignedIn ? GENSHIN_ACCOUNT_CHARACTER_PACK_FILE_BASE_URL : undefined"
    :account-name="session.data?.user.name"
    :character-pack-base-url="IS_DEVELOPMENT ? GENSHIN_CHARACTER_PACK_BASE_URL : undefined"
    :create-terrain-worker="() => new TerrainTileWorker()"
    :game-data-base-url="getGenshinGameDataBaseUrl(containerBaseUrl)"
    :game-text
    :is-paused
    :is-tuning="IS_DEVELOPMENT || undefined"
    :keep-account-character-pack="isSignedIn ? keepAccountCharacterPack : undefined"
    :language
    :quality-tier="GENSHIN_QUALITY_TIER"
    :remove-account-character-pack="isSignedIn ? removeAccountCharacterPack : undefined"
    :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
    :save
    :scene-export-base-url="IS_DEVELOPMENT ? GENSHIN_SCENE_EXPORT_BASE_URL : undefined"
    :server-clock-offset-ms
    @grant="emit('grant')"
    @quit="navigateTo(RoutePath.Index)"
    @ready="emit('ready')"
    @save="(newSave) => emit('save', newSave)"
  />
</template>
