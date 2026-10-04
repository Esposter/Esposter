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
  // How far the world's loading has gone, from 0 to 1, which the startup loading screen's marks show once the door
  // Is opened
  progress: number;
}

const { gameText, language, playerName, progress } = defineProps<Props>();
const emit = defineEmits<{ begin: []; finish: [] }>();
// The game's opening as one sequence: its splashes on white, then the login screen under the sky of the player's
// Hour, its title waiting for a click, its flight and its door waiting for another, then the startup loading screen,
// Which loads the world and whose white the world cuts in from. The login screen's bar is the game's own checks,
// Which have nothing left to wait on once the page has loaded, so it sweeps at its fastest. Each phase says when it is
// Done, so the handoffs are the screens' own timings rather than a host's, and `begin` tells the host the door has been
// Opened
const phase = ref(OpeningPhase.Splash);
const timeOfDay = getLoginTimeOfDay(Temporal.Now.plainTimeISO());
</script>

<template>
  <SplashSequence v-if="phase === OpeningPhase.Splash" :game-text :language @finish="phase = OpeningPhase.Login" />
  <LoginScreen
    v-else-if="phase === OpeningPhase.Login"
    :game-text
    :language
    :player-name
    :progress="1"
    :time-of-day
    @begin="
      phase = OpeningPhase.Loading;
      emit('begin');
    "
  />
  <LoadingStartup v-else :progress @finish="emit('finish')" />
</template>
