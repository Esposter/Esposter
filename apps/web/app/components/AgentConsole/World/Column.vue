<script setup lang="ts">
import type { PaletteColor } from "@/models/agentConsole/PaletteColor";

import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import { createTintableVoxelGeometry } from "@/services/agentConsole/world/createTintableVoxelGeometry";
import { Vector3 } from "three";

interface Props {
  color: PaletteColor;
  height: number;
  position: Vector3;
}

const { color, height, position } = defineProps<Props>();
// Stretched to the height it reads and tinted by the material, so a change of either costs no rebuild
const geometry = createTintableVoxelGeometry();
const scale = computed(() => new Vector3(1, height, 1));
</script>

<template>
  <TresMesh v-if="height > 0" :geometry :position :scale>
    <TresMeshBasicMaterial :color="AgentConsolePaletteMap[color]" vertex-colors />
  </TresMesh>
</template>
