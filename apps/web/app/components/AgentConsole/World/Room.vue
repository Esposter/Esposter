<script setup lang="ts">
import { createRoomGrid } from "@/services/agentConsole/world/createRoomGrid";
import { createVoxelGeometry } from "@/services/agentConsole/world/createVoxelGeometry";
// The floor, the walls and every object in one mesh, built once
const geometry = createVoxelGeometry(createRoomGrid());
</script>

<template>
  <TresMesh :geometry>
    <TresMeshBasicMaterial vertex-colors />
  </TresMesh>
</template>
