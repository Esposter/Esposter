<script setup lang="ts">
import type { PaletteColor } from "@/models/agentConsole/PaletteColor";

import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import { createVoxelGeometry } from "@/services/agentConsole/world/createVoxelGeometry";
import { Vector3 } from "three";

interface Props {
  color: PaletteColor;
  height: number;
  position: Vector3;
}

const { color, height, position } = defineProps<Props>();
// One white voxel stretched to the height it reads and tinted by the material, so a change of either costs no rebuild
const geometry = createVoxelGeometry({ depth: 1, height: 1, voxels: Uint8Array.of(1), width: 1 }, [[1, 1, 1]]);
const scale = computed(() => new Vector3(1, height, 1));
</script>

<template>
  <TresMesh v-if="height > 0" :geometry :position :scale>
    <TresMeshBasicMaterial :color="AgentConsolePaletteMap[color]" vertex-colors />
  </TresMesh>
</template>
