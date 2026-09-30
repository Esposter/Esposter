<script setup lang="ts">
import StartupLoading from "#src/components/interface/loading/StartupLoading.vue";
import LoginScreen from "#src/components/interface/login/LoginScreen.vue";
import SplashSequence from "#src/components/interface/splash/SplashSequence.vue";
import { OpeningPhase } from "#src/models/interface/opening/OpeningPhase";
import { getLoginTimeOfDay } from "#src/services/login/getLoginTimeOfDay";

interface Props {
  // How far loading has gone, from 0 to 1, which the startup loading screen shows once the login screen is left
  progress: number;
}

const { progress } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's opening as one sequence: its splashes on white, then the login screen under the sky of the player's
// Hour until a click begins, then the startup loading screen, whose white the world cuts in from. Each phase says
// When it is done, so the handoffs are the screens' own timings rather than a host's
const phase = ref(OpeningPhase.Splash);
const timeOfDay = getLoginTimeOfDay(Temporal.Now.plainTimeISO());
</script>

<template>
  <SplashSequence v-if="phase === OpeningPhase.Splash" @finish="phase = OpeningPhase.Login" />
  <LoginScreen v-else-if="phase === OpeningPhase.Login" :time-of-day @begin="phase = OpeningPhase.Loading" />
  <StartupLoading v-else :progress @finish="emit('finish')" />
</template>
