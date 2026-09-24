<script setup lang="ts">
import type { usePlayerInput } from "@/composables/agentConsole/world/usePlayerInput";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import { PROMPT_LABEL_HEIGHT, PROMPT_OUTLINE_MARGIN } from "@/services/agentConsole/world/constants";
import { findReachableObject } from "@/services/agentConsole/world/findReachableObject";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";
import { Html } from "@tresjs/cientos";
import { BoxGeometry, EdgesGeometry, Vector3 } from "three";

interface Props {
  playerInput: ReturnType<typeof usePlayerInput>;
}

const { playerInput } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const agentConsolePlayerStore = useAgentConsolePlayerStore();
const { playerState } = agentConsolePlayerStore;
const { reachableWorldPrompt } = storeToRefs(agentConsolePlayerStore);
const worldPrompts = useWorldPrompts();
// One box's edges, scaled and placed over whatever is in reach, the way a voxel game outlines the block a player
// Looks at
const outlineGeometry = new EdgesGeometry(new BoxGeometry(1, 1, 1));
const outlinePosition = computed(() => {
  if (!reachableWorldPrompt.value) return new Vector3();
  const { max, min } = reachableWorldPrompt.value;
  return new Vector3((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
});
const outlineScale = computed(() => {
  if (!reachableWorldPrompt.value) return new Vector3();
  const { max, min } = reachableWorldPrompt.value;
  return new Vector3(max[0] - min[0], max[1] - min[1], max[2] - min[2]).addScalar(PROMPT_OUTLINE_MARGIN);
});
const labelPosition = computed(() => {
  const labelPositionVector = outlinePosition.value.clone();
  labelPositionVector.y += outlineScale.value.y / 2 + PROMPT_LABEL_HEIGHT;
  return labelPositionVector;
});
// What is in reach is found on every frame the player may have moved, and written only when it changes. A gamepad's
// Use trigger does what E does
onBeforeRender(() => {
  const newReachableWorldPrompt = findReachableObject(playerState.position, playerState.heading, worldPrompts.value);
  if (newReachableWorldPrompt !== reachableWorldPrompt.value) reachableWorldPrompt.value = newReachableWorldPrompt;
  if (playerInput.readUse()) reachableWorldPrompt.value?.run();
});
</script>

<template>
  <template v-if="reachableWorldPrompt">
    <TresLineSegments :geometry="outlineGeometry" :position="outlinePosition" :scale="outlineScale">
      <TresLineBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Text]" />
    </TresLineSegments>
    <!-- Ordinary HTML facing the camera, and a button a touch presses in place of the key. It is rendered apart from
      The app, so it holds nothing that needs the app's context, and it is remounted for each thing rather than updated -->
    <Html :key="reachableWorldPrompt.id" :position="labelPosition" center>
      <button ui-button flex gap-2 ws-nowrap items-center type="button" @click="reachableWorldPrompt.run()">
        <UiShortcut shortcut="e" />
        {{ reachableWorldPrompt.title }}
      </button>
    </Html>
  </template>
</template>
