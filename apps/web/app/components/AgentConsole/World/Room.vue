<script setup lang="ts">
import type { TresPointerEvent } from "@tresjs/core";

import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { createRoomGrid } from "@/services/agentConsole/world/createRoomGrid";
import { createVoxelGeometry } from "@/services/agentConsole/world/createVoxelGeometry";
import { getWorldObjectType } from "@/services/agentConsole/world/getWorldObjectType";
import { WorldObjectPanelTypeMap } from "@/services/agentConsole/world/WorldObjectPanelTypeMap";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { RoutePath } from "@esposter/shared";

const { renderer } = useTres();
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openedPanelType } = storeToRefs(agentConsolePanelStore);
// The floor, the walls and every object in one mesh, built once
const geometry = createVoxelGeometry(createRoomGrid());
// The voxel a pointer is over, found by stepping half a voxel back through the face it hit
const getPointedWorldObjectType = ({ face, point }: TresPointerEvent) =>
  face
    ? getWorldObjectType([
        Math.floor(point.x - face.normal.x / 2),
        Math.floor(point.y - face.normal.y / 2),
        Math.floor(point.z - face.normal.z / 2),
      ])
    : undefined;
</script>

<template>
  <TresMesh
    :geometry
    @click="
      (event: TresPointerEvent) => {
        const worldObjectType = getPointedWorldObjectType(event);
        if (worldObjectType === WorldObjectType.Door) navigateTo(RoutePath.Index);
        else if (worldObjectType) openedPanelType = WorldObjectPanelTypeMap[worldObjectType];
      }
    "
    @pointerleave="renderer.domElement.style.cursor = ''"
    @pointermove="
      (event: TresPointerEvent) => {
        renderer.domElement.style.cursor = getPointedWorldObjectType(event) ? 'pointer' : '';
      }
    "
  >
    <TresMeshBasicMaterial vertex-colors />
  </TresMesh>
</template>
