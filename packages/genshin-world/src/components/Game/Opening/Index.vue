<script setup lang="ts">
import type { LoginData } from "#src/models/login/LoginData";
import type { GameLanguage, GameText } from "genshin-text";

import LoadingStartup from "#src/components/Loading/Startup/Index.vue";
import LoginScreen from "#src/components/Login/Screen/Index.vue";
import SplashSequence from "#src/components/Splash/Sequence/Index.vue";
import { OpeningPhase } from "#src/models/game/OpeningPhase";
import { getLoginTimeOfDay } from "#src/services/login/getLoginTimeOfDay";
import { readLoginData } from "#src/services/login/readLoginData";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { getResultAsync } from "@esposter/shared";
import { GameScreen } from "genshin-interface";

interface Props {
  // Where the hosted game data is read from: the title logo and the login screen's records
  gameDataBaseUrl: string;
  // The game's words in the reader's language, which its host resolves and loads
  gameText: GameText;
  // The reader's language, whose client's title logo the opening shows
  language: GameLanguage;
  // Where the login music's recordings are served from
  musicRecordingBaseUrl: string;
  // The name the login screen welcomes the player by
  playerName?: string;
  // How far the world's loading has gone, from 0 to 1, which the startup loading screen's marks show once the door
  // Is opened
  progress: number;
}

const { gameDataBaseUrl, gameText, language, musicRecordingBaseUrl, playerName, progress } = defineProps<Props>();
const emit = defineEmits<{ begin: []; finish: [] }>();
// The game's opening as one sequence: its splashes on white, then the login screen under the sky of the player's
// Hour, its title waiting for a click, its flight and its door waiting for another, then the startup loading screen,
// Which loads the world and whose white the world cuts in from. The login screen's bar is the game's own checks,
// Which have nothing left to wait on once the page has loaded, so it sweeps at its fastest. Each phase says when it is
// Done, so the handoffs are the screens' own timings rather than a host's, and `begin` tells the host the door has been
// Opened
const phase = ref(OpeningPhase.Splash);
const timeOfDay = getLoginTimeOfDay(Temporal.Now.plainTimeISO());
// The title logo is read before the first splash and the login screen's records while the splashes play, so on a warm
// Cache neither adds a wait; a phase whose read has not arrived holds the white the splashes play on, and a read that
// Fails is logged and the white stays
const titleLogoPath = shallowRef("");
const loginData = shallowRef<LoginData>();
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readTitleLogoPath(gameDataBaseUrl, GameLanguageTitleLogoMap[language])).match(
  (newTitleLogoPath) => {
    titleLogoPath.value = newTitleLogoPath;
  },
  (error) => {
    console.error(error);
  },
);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => readLoginData(gameDataBaseUrl)).match(
  (newLoginData) => {
    loginData.value = newLoginData;
  },
  (error) => {
    console.error(error);
  },
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
    :game-text
    :language
    :login-data
    :music-recording-base-url
    :player-name
    :progress="1"
    :time-of-day
    @begin="
      phase = OpeningPhase.Loading;
      emit('begin');
    "
  />
  <LoadingStartup v-else-if="phase === OpeningPhase.Loading" :game-text :progress @finish="emit('finish')" />
  <GameScreen v-else class="waiting" />
</template>

<style scoped>
.waiting {
  background: var(--white);
}
</style>
