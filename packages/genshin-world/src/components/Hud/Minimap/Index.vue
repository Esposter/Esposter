<script setup lang="ts">
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { CanvasRect } from "genshin-interface";
import type { GameText } from "genshin-text";

import MapDrawing from "#src/components/Map/Drawing/Index.vue";
import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { MAP_GROUND, MAP_MARK_SHARE, MINIMAP_RADIUS } from "#src/services/map/constants";
import { GameRect } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { MathUtils } from "three";

interface Props {
  camera: MapCamera;
  // The regions and their areas, whose drawn outlines the minimap shows
  catalogue: Catalogue;
  // The game's words in the reader's language
  gameText: GameText;
  // The HUD's fitted rects, the minimap's back and its marks among them
  interfaceRects: HudInterfaceRects;
  landmarks: Landmark[];
  // The resolved rect of `GrpMiniMap`, which the tree hangs the back and the marks under
  parent: CanvasRect;
}

const { camera, catalogue, gameText, interfaceRects, landmarks, parent } = defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <!-- The map's drawing cut to a circle round the player, north up as the game keeps it, in `GrpBackMap`'s rect.
       Pressing it opens the map, as M does -->
  <GameRect :parent :rect="interfaceRects[HudInterfaceRectName.BackMap]">
    <button class="minimap" type="button" :aria-label="gameText[GameTextKey.Map]" @click="emit('open')">
      <svg
        :viewBox="`${-MINIMAP_RADIUS} ${-MINIMAP_RADIUS} ${MINIMAP_RADIUS * 2} ${MINIMAP_RADIUS * 2}`"
        aria-hidden="true"
      >
        <g :transform="`translate(${-camera.x} ${-camera.z})`">
          <MapDrawing :catalogue :landmarks :mark-radius="MINIMAP_RADIUS * 2 * MAP_MARK_SHARE" />
        </g>
      </svg>
    </button>
  </GameRect>
  <!-- The marks over it in `GrpMap`'s rect, as the tree places them: the N at the top of the rim, which never turns,
       The view's fan turned the way the camera looks, and the character's arrow at the centre turned the way it faces,
       Each turned the other way about the vertical than three turns it, since the map looks down on the ground -->
  <GameRect #default="{ rect: marksRect }" :parent :rect="interfaceRects[HudInterfaceRectName.MapMarks]">
    <GameRect #default="{ rect: southRect }" :parent="marksRect" :rect="interfaceRects[HudInterfaceRectName.SouthMark]">
      <GameRect :parent="southRect" :rect="interfaceRects[HudInterfaceRectName.SouthImage]">
        <!-- Provisional: the N's serif capital, written from its measures at 1080 high, where its image's 28 units are
             20.16 pixels -->
        <svg class="north" viewBox="-2.28 -2.58 20.16 20.16" aria-hidden="true">
          <path d="M0 0H4.2L12.8 11.2V0.9H11.2V0H15.6V0.9H14V15H12.1L2.8 2.6V14.1H4.3V15H0.6V14.1H1.6V0.9H0Z" />
        </svg>
      </GameRect>
    </GameRect>
    <GameRect :parent="marksRect" :rect="interfaceRects[HudInterfaceRectName.SightFanMark]">
      <div class="fan" :style="{ rotate: `${-MathUtils.radToDeg(camera.yaw)}deg` }" />
    </GameRect>
    <GameRect :parent="marksRect" :rect="interfaceRects[HudInterfaceRectName.LocalAvatarMark]">
      <!-- Provisional: the arrow's notched head, written from its measures at 1080 high, where its image's 50 by 52
           Units are 36 by 37.44 pixels -->
      <svg
        class="arrow"
        viewBox="-18 -18.72 36 37.44"
        aria-hidden="true"
        :style="{ rotate: `${-MathUtils.radToDeg(camera.facing)}deg` }"
      >
        <path d="M0 -11L11 11L0 8L-11 11Z" />
      </svg>
    </GameRect>
  </GameRect>
</template>

<style scoped>
/* Provisional: the back's ring and fade, measured at 1080 high on the English PC client's world HUD and on the Chinese
   Client's over open sea. The drawing stands on the map's ground, as the overlay's does, and fades out over the rim's
   Outer sixth to a thin light ring */
.minimap {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: 50%;
  background: none;
  box-shadow: inset 0 0 0 calc(var(--canvas-unit) * 1.25) rgb(255 255 255 / 0.2);
  cursor: inherit;
  pointer-events: auto;
}

.minimap svg {
  display: block;
  width: 100%;
  height: 100%;
  background: v-bind(MAP_GROUND);
  mask-image: radial-gradient(closest-side, #000 84%, transparent 96%);
  /* The drawing's marks answer the overlay's clicks, never the minimap's, whose whole face is one button */
  pointer-events: none;
}

.north {
  display: block;
  width: 100%;
  height: 100%;
  fill: rgb(255 255 255 / 0.6);
}

/* Provisional: the fan's white, measured over open sea, strongest at the centre and gone by 80 of its image's 97
   Units, across the quarter turn its image spans */
.fan {
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle calc(var(--canvas-unit) * 80) at 50% 100%,
    rgb(255 255 255 / 0.42),
    rgb(255 255 255 / 0)
  );
  clip-path: polygon(50% 100%, 0 31.4%, 0 0, 100% 0, 100% 31.4%);
  transform-origin: 50% 100%;
}

/* Provisional: the arrow's cyan, measured on the English PC client's world HUD */
.arrow {
  display: block;
  width: 100%;
  height: 100%;
  fill: rgb(2 207 251);
}
</style>
