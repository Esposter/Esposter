<script setup lang="ts">
import {
  FALLING_STAR_CAMERA_DISTANCE,
  FALLING_STAR_DURATION_SECONDS,
  FALLING_STAR_FOV_DEGREES,
} from "@/services/agentConsole/constants";
import { getFallingStarY } from "@/services/agentConsole/getFallingStarY";

interface Props {
  // The star's colour, which its character's rarity sets
  color: string;
}

const { color } = defineProps<Props>();
const emit = defineEmits<{ land: [] }>();
const { onRender } = useLoop();
const starY = ref(getFallingStarY(0));
let hasLanded = false;

onRender(({ elapsed }) => {
  starY.value = getFallingStarY(elapsed);
  // Lands once, and the wish banner takes the nameplate over from there
  if (hasLanded || elapsed < FALLING_STAR_DURATION_SECONDS) return;

  hasLanded = true;
  emit("land");
});
</script>

<template>
  <div absolute inset-0 pointer-events-none>
    <TresCanvas :clear-alpha="0" :window-size="false">
      <TresPerspectiveCamera :fov="FALLING_STAR_FOV_DEGREES" :position="[0, 0, FALLING_STAR_CAMERA_DISTANCE]" />
      <TresGroup :position="[0, starY, 0]">
        <TresMesh>
          <TresOctahedronGeometry :args="[0.06]" />
          <TresMeshBasicMaterial :color :tone-mapped="false" />
        </TresMesh>
        <Sparkles :count="40" :color :scale="[0.3, 0.3, 0.3]" :size="6" />
      </TresGroup>
    </TresCanvas>
  </div>
</template>
