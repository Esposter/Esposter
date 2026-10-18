<script setup lang="ts">
import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { GameText } from "genshin-text";

import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { ShortcutWheelDirectionCountScreenKindsMap } from "#src/services/shortcutWheel/ShortcutWheelDirectionCountScreenKindsMap";
import { computed } from "vue";

// The wheel's geometry in its own units: the entries lie in the ring between the inner and outer radius, and their labels
// Sit on the label radius at each entry's middle
const CENTER = 100;
const OUTER_RADIUS = 100;
const INNER_RADIUS = 30;
const LABEL_RADIUS = 65;

interface Props {
  directionCount: ShortcutWheelDirectionCount;
  // The game's words in the reader's language, which name each entry
  gameText: GameText;
  // The entry the pointer points toward, or none when it is at the centre
  pickedIndex?: number;
}

const { directionCount, gameText, pickedIndex } = defineProps<Props>();
// The point at a radius and an angle clockwise from the top, which is where the wheel's zero lies
const getPoint = (radius: number, angle: number): string =>
  `${CENTER + radius * Math.sin(angle)} ${CENTER - radius * Math.cos(angle)}`;
const wedges = computed(() => {
  const sectorAngle = (2 * Math.PI) / directionCount;
  return ShortcutWheelDirectionCountScreenKindsMap[directionCount].map((screenKind, index) => {
    const centerAngle = index * sectorAngle;
    const startAngle = centerAngle - sectorAngle / 2;
    const endAngle = centerAngle + sectorAngle / 2;
    const labelPoint = getPoint(LABEL_RADIUS, centerAngle).split(" ");
    return {
      isPicked: index === pickedIndex,
      label: gameText[ScreenKindGameTextKeyMap[screenKind]],
      labelX: labelPoint[0],
      labelY: labelPoint[1],
      path: [
        `M ${getPoint(INNER_RADIUS, startAngle)}`,
        `L ${getPoint(OUTER_RADIUS, startAngle)}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${getPoint(OUTER_RADIUS, endAngle)}`,
        `L ${getPoint(INNER_RADIUS, endAngle)}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${getPoint(INNER_RADIUS, startAngle)}`,
        "Z",
      ].join(" "),
    };
  });
});
</script>

<template>
  <!-- The entries as wedges around the centre, the one the pointer points toward lit. The layout is provisional, drawn from
       the wiki's description of the wheel until the parity loop traces the game's own -->
  <svg class="shortcut-wheel" role="listbox" :viewBox="`0 0 ${CENTER * 2} ${CENTER * 2}`">
    <g
      v-for="({ isPicked, label, labelX, labelY, path }, index) of wedges"
      :key="index"
      class="wedge"
      role="option"
      :aria-label="label"
      :aria-selected="isPicked"
    >
      <path :d="path" :class="{ picked: isPicked }" />
      <text :x="labelX" :y="labelY">{{ label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.shortcut-wheel {
  height: 100%;
  width: 100%;
}

.wedge path {
  fill: rgb(0 0 0 / 0.5);
  stroke: rgb(255 255 255 / 0.4);
}

.wedge .picked {
  fill: rgb(255 255 255 / 0.7);
}

.wedge text {
  dominant-baseline: middle;
  fill: white;
  font-size: 12px;
  text-anchor: middle;
}
</style>
