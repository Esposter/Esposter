<script setup lang="ts">
import type { Mesh, Vector3Tuple } from "three";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { FIGURE_BREATH_HEIGHT, FIGURE_BREATH_SPEED, FIGURE_SPEED } from "@/services/agentConsole/world/constants";
import { createFigureGrid } from "@/services/agentConsole/world/createFigureGrid";
import { createVoxelGeometry } from "@/services/agentConsole/world/createVoxelGeometry";
import { WorldObjectMap } from "@/services/agentConsole/world/WorldObjectMap";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { Vector3 } from "three";

interface Props {
  isMain: boolean;
  position: Vector3Tuple;
}

const { isMain, position } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openedPanelType } = storeToRefs(agentConsolePanelStore);
const reducedMotion = usePreferredReducedMotion();
// Three voxels to one unit of the room, standing on its feet at its origin
const geometry = createVoxelGeometry(createFigureGrid(isMain ? PaletteColor.Cloth : PaletteColor.SubagentCloth))
  .scale(1 / 3, 1 / 3, 1 / 3)
  .translate(-0.5, 0, -1 / 3);
// The main agent walks in through the door, a subagent through the portal
const spawnPosition = new Vector3(
  ...WorldObjectMap[isMain ? WorldObjectType.Door : WorldObjectType.Portal].standPosition,
);
const figure = useTresTemplateRef<Mesh>("figure");
const target = new Vector3();
const step = new Vector3();

watchImmediate(
  () => position,
  ([x, y, z]) => {
    target.set(x, y, z);
  },
);
// Walks to where it should stand, then breathes there; the vectors are reused, so a frame allocates nothing
onBeforeRender(({ delta, elapsed }) => {
  if (!figure.value) return;
  // Asked for reduced motion, it is simply there, and still
  if (reducedMotion.value === "reduce") {
    figure.value.position.copy(target);
    return;
  }

  step.set(target.x - figure.value.position.x, 0, target.z - figure.value.position.z);
  const stepLength = FIGURE_SPEED * delta;
  if (step.length() > stepLength) {
    figure.value.rotation.y = Math.atan2(step.x, step.z);
    figure.value.position.add(step.setLength(stepLength));
    figure.value.position.y = target.y;
  } else
    figure.value.position.set(
      target.x,
      target.y + Math.sin(elapsed * FIGURE_BREATH_SPEED) * FIGURE_BREATH_HEIGHT,
      target.z,
    );
});
</script>

<template>
  <TresMesh ref="figure" :geometry :position="spawnPosition" @click="openedPanelType = AgentConsolePanelType.Timeline">
    <TresMeshBasicMaterial vertex-colors />
  </TresMesh>
</template>
