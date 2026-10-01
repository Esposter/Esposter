<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";

import LoadingStartup from "#src/components/Loading/Startup/Index.vue";
import LoginScreen from "#src/components/Login/Screen/Index.vue";
import SplashSequence from "#src/components/Splash/Sequence/Index.vue";
import { OpeningPhase } from "#src/models/game/OpeningPhase";
import { getLoginTimeOfDay } from "#src/services/login/getLoginTimeOfDay";

interface Props {
  // The game's words in the reader's language, which its host resolves and loads
  gameText: GameText;
  // The reader's language, whose client's title logo the opening shows
  language: GameLanguage;
  // The name the login screen welcomes the player by
  playerName?: string;
  // How far loading has gone, from 0 to 1, which the login screen's flight follows and the startup loading screen
  // Shows once the login screen is left
  progress: number;
}

const { gameText, language, playerName, progress } = defineProps<Props>();
const emit = defineEmits<{ begin: []; finish: [] }>();
// The game's opening as one sequence: its splashes on white, then the login screen under the sky of the player's
// Hour, its title waiting for a click, its flight following loading and its door waiting for another, then the
// Startup loading screen, whose white the world cuts in from. Each phase says when it is done, so the handoffs are
// The screens' own timings rather than a host's, and `begin` tells the host the door has been opened
const phase = ref(OpeningPhase.Splash);
const timeOfDay = getLoginTimeOfDay(Temporal.Now.plainTimeISO());
</script>

<template>
  <SplashSequence v-if="phase === OpeningPhase.Splash" :game-text :language @finish="phase = OpeningPhase.Login" />
  <LoginScreen
    v-else-if="phase === OpeningPhase.Login"
    :game-text
    :player-name
    :progress
    :time-of-day
    @begin="
      phase = OpeningPhase.Loading;
      emit('begin');
    "
  />
  <LoadingStartup v-else :progress @finish="emit('finish')" />
</template>
