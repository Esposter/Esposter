<script setup lang="ts">
import type { RenderStatistics } from "@/models/agentConsole/world/RenderStatistics";
import type { TresContext } from "@tresjs/core";
import type { Vector2Like } from "three";

import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { NoToneMapping } from "three";
// What the renderer did, shown in development. It is not reactive, so counting a frame never re-renders the canvas
// That drew it, and the count measures the world rather than itself
const renderStatistics: RenderStatistics = { drawCalls: 0, renderCount: 0, triangles: 0 };
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isWorldReady } = storeToRefs(agentConsolePanelStore);
const joystickDirection = ref<Vector2Like>({ x: 0, y: 0 });
const playerInput = usePlayerInput(joystickDirection);
const isTouchScreen = useMediaQuery("(pointer: coarse)");
// A world that cannot start, where WebGL is unavailable, still lets the loading screen go: the panels work without it
onUnmounted(() => {
  isWorldReady.value = false;
});
</script>

<template>
  <div class="world" size-full relative>
    <!-- Drawn every frame, so the room stays live, at half the device's pixels scaled up unsmoothed: a quarter of the -->
    <!-- Fill cost, and the voxels read as pixels for it -->
    <TresCanvas
      :antialias="false"
      :clear-color="AgentConsolePaletteMap[PaletteColor.Background]"
      :dpr="0.5"
      :tone-mapping="NoToneMapping"
      @error="isWorldReady = true"
      @ready="isWorldReady = true"
      @render="
        ({ renderer }: TresContext) => {
          if (!IS_DEVELOPMENT) return;
          renderStatistics.renderCount++;
          renderStatistics.drawCalls = renderer.instance.info.render.calls;
          renderStatistics.triangles = renderer.instance.info.render.triangles;
        }
      "
    >
      <AgentConsoleWorldScene :player-input />
      <!-- After the scene, so it follows where the player was drawn this frame rather than the frame before -->
      <AgentConsoleWorldFollowCamera :player-input />
    </TresCanvas>
    <!-- On a touch screen, a joystick in the lower corner walks the player, and a drag anywhere else turns the camera -->
    <AgentConsoleJoystick v-if="isTouchScreen" v-model="joystickDirection" bottom-4 left-4 absolute />
    <!-- The readouts along the bottom: the host's connection always, and in development what the renderer did -->
    <div flex gap-2 pointer-events-none bottom-2 right-2 absolute>
      <AgentConsolePanelConnectionStatus v-if="status !== ConnectionStatus.Unpaired" />
      <AgentConsoleWorldStatistics v-if="IS_DEVELOPMENT" :render-statistics />
    </div>
  </div>
</template>

<style scoped>
.world :deep(canvas) {
  image-rendering: pixelated;
  /* A drag on the room turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
