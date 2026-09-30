<script setup lang="ts">
import StartupLoading from "#src/components/interface/loading/StartupLoading.vue";
import SplashSequence from "#src/components/interface/splash/SplashSequence.vue";
import { OpeningPhase } from "#src/models/interface/opening/OpeningPhase";

interface Props {
  // How far loading has gone, from 0 to 1, which the startup loading screen shows once the splashes are done
  progress: number;
}

const { progress } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's opening as one sequence: its splashes on white, then the startup loading screen, whose white the world
// Cuts in from. Each phase says when it is done, so the handoffs are the screens' own timings rather than a host's
const phase = ref(OpeningPhase.Splash);
</script>

<template>
  <SplashSequence v-if="phase === OpeningPhase.Splash" @finish="phase = OpeningPhase.Loading" />
  <StartupLoading v-else :progress @finish="emit('finish')" />
</template>
