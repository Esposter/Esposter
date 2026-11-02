<script setup lang="ts">
import type { GameTextSegment } from "genshin-text";

import {
  MAP_LABEL_SHARE,
  MAP_PROGRESS_OFFSET_SHARE,
  MAP_PROGRESS_SHARE,
  MAP_REFERENCE_ZOOM_METRES,
  MAP_SUBAREA_LABEL_SHARE,
} from "#src/services/map/constants";

interface Props {
  // Each filled area's name at its place, with the progress line the game writes beside it where the area has any
  areaLabels: { id: string; name: string; progressSegments: GameTextSegment[]; x: number; y: number }[];
  // The drawn metres across the map's width, which each name is sized at
  metres: number;
  // Each subarea's name at its place, drawn only while the view is no further out than MAP_REFERENCE_ZOOM_METRES
  subareaNames: { name: string; x: number; y: number }[];
}

const { areaLabels, metres, subareaNames } = defineProps<Props>();
</script>

<template>
  <template v-if="metres <= MAP_REFERENCE_ZOOM_METRES">
    <text
      v-for="({ name, x, y }, index) of subareaNames"
      :key="index"
      class="subarea-name"
      :font-size="metres * MAP_SUBAREA_LABEL_SHARE"
      :x
      :y
    >
      {{ name }}
    </text>
  </template>
  <template v-for="{ id, name, progressSegments, x, y } of areaLabels" :key="id">
    <text class="area-name" :font-size="metres * MAP_LABEL_SHARE" :x :y>
      {{ name }}
    </text>
    <text
      v-if="progressSegments.length > 0"
      class="area-progress"
      :font-size="metres * MAP_PROGRESS_SHARE"
      :x
      :y="y + metres * MAP_PROGRESS_OFFSET_SHARE"
    >
      <tspan v-for="({ color, text }, index) of progressSegments" :key="index" :fill="color" :stroke="color">{{
        text
      }}</tspan>
    </text>
  </template>
</template>

<style scoped>
/* The labels' white, read off the English map's ink over Galesong Hill, which draws them with no outline. Signika is
   Narrower than the game's face at one cap height, so each line keeps the game's cap height and is spaced out toward
   Its width (the name 252 pixels across, its line 278), at the spacing whose strokes score nearest the game's. Signika's
   strokes are also thinner than the game's face at that cap height, so each glyph is thickened by a hairline in its own
   colour; a progress segment's own colour is its stroke too, so a gold line stays gold */
.area-name,
.area-progress {
  fill: #e5e9e0;
  stroke: #e5e9e0;
  stroke-width: 0.4;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

.area-name {
  letter-spacing: 0.04em;
}

/* The subarea names' white, the mean of the ink the English map draws over Jueyun Karst, which it sets without an outline,
   so the name is drawn alone. Measured against `map-overlay-jueyun`: the ink's mean is dimmer than the brightest name's, so
   the fill is held at 90% and the name's baseline sits 2.4 units lower, where the page's font puts the reference's cap band */
.subarea-name {
  fill: rgb(232 250 252);
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  letter-spacing: 0.07em;
  translate: 0 2.4px;
  fill-opacity: 0.9;
}

.area-progress {
  letter-spacing: 0.03em;
}
</style>
