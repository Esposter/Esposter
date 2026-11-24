<script setup lang="ts">
import type { LoginData } from "#src/models/login/LoginData";
import type { GameLanguage, GameText } from "genshin-text";

import LoadingStartup from "#src/components/Loading/Startup/Index.vue";
import LoginScreen from "#src/components/Login/Screen/Index.vue";
import SplashSequence from "#src/components/Splash/Sequence/Index.vue";
import { OpeningPhase } from "#src/models/game/OpeningPhase";
import { LoginStage } from "#src/models/login/LoginStage";
import { readGameDataPreloadSet } from "#src/services/data/readGameDataPreloadSet";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { getLoginTimeOfDay } from "#src/services/login/getLoginTimeOfDay";
import { readLoginData } from "#src/services/login/readLoginData";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { getResultAsync } from "@esposter/shared";
import { whenever } from "@vueuse/core";
import { GameScreen } from "genshin-interface";
import { HostedAssetPreloadStatus, useHostedAssetsPreload } from "hosted-assets";

interface Props {
  // Where the hosted game data is read from: the title logo and the login screen's records
  gameDataBaseUrl: string;
  // The game's words in the reader's language, which its host resolves and loads
  gameText: GameText;
  // The reader's language, whose client's title logo the opening shows
  language: GameLanguage;
  // The name the login screen welcomes the player by
  playerName: string;
  // How far the world's loading has gone, from 0 to 1, which the startup loading screen's marks show once the door
  // Is opened
  progress: number;
  // Where the host serves the developer's own exports of the game's scenes, which the login screen's scene is drawn
  // From
  sceneExportBaseUrl: string;
}

const { gameDataBaseUrl, language } = defineProps<Props>();
const emit = defineEmits<{ begin: []; download: []; finish: []; held: [] }>();
// The game's opening as one sequence: its splashes on white, then the login screen under the sky of the player's
// Hour, its title waiting for a click, its flight and its door waiting for another, then the startup loading screen,
// Which loads the world and whose white the world cuts in from. The login screen's bar reports the game data objects
// And the character packs, which the door waits on as the game's does on its bar. Each phase says when it is done.
// So the handoffs are the screens' own timings rather than a host's, and `begin` tells the host the door has opened
const phase = ref<OpeningPhase>(OpeningPhase.Splash);
const timeOfDay = getLoginTimeOfDay(Temporal.Now.plainTimeISO());
// The title logo is read before the first splash and the login screen's records while the splashes play, so on a warm
// Cache neither adds a wait; a phase whose read has not arrived holds the white the splashes play on, and a read that
// Fails is logged and the white stays
const titleLogoPath = shallowRef("");
const loginData = shallowRef<LoginData>();
getResultAsync(() =>
  measureLoadStep("opening", readTitleLogoPath(gameDataBaseUrl, GameLanguageTitleLogoMap[language])),
).match(
  (newTitleLogoPath) => {
    titleLogoPath.value = newTitleLogoPath;
  },
  (error) => {
    console.error(error);
  },
);
getResultAsync(() => measureLoadStep("opening", readLoginData(gameDataBaseUrl))).match(
  (newLoginData) => {
    loginData.value = newLoginData;
  },
  (error) => {
    console.error(error);
  },
);
// The login screen's stage, which the download starts on: the click that begins the login, as the game's download
// Does, so the splashes and the title load nothing. The launch loading bar reports the download's share once it runs
const loginStage = ref<LoginStage>(LoginStage.Arriving);
const { downloadProgress, isDownloading, preload, status } = useHostedAssetsPreload(
  () => readGameDataPreloadSet(gameDataBaseUrl),
  () => emit("held"),
);
whenever(
  () => loginStage.value === LoginStage.Preparing,
  () => {
    emit("download");
    return preload();
  },
  { once: true },
);
</script>

<template>
  <SplashSequence
    v-if="phase === OpeningPhase.Splash && titleLogoPath"
    :game-text
    :language
    :title-logo-path
    @finish="phase = OpeningPhase.Login"
  />
  <LoginScreen
    v-else-if="phase === OpeningPhase.Login && loginData"
    v-model:stage="loginStage"
    :game-data-base-url
    :game-text
    :is-download-failed="status === HostedAssetPreloadStatus.Failed"
    :is-downloading="isDownloading"
    :is-interface-hidden="false"
    :language
    :login-data
    :player-name
    :progress="downloadProgress"
    :scene-export-base-url
    :time-of-day
    @begin="
      phase = OpeningPhase.Loading;
      emit('begin');
    "
    @retry="preload()"
  />
  <LoadingStartup v-else-if="phase === OpeningPhase.Loading" :game-text :progress @finish="emit('finish')" />
  <GameScreen v-else class="waiting" />
</template>

<style scoped>
.waiting {
  background: var(--white);
}
</style>
