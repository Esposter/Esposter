<script setup lang="ts">
import type { CharacterMenuTab } from "genshin-interface";

import { Element } from "#src/models/Element";
import { ElementNebulaMap } from "#src/services/character/ElementNebulaMap";

interface Props {
  // The element of the character the scene stands behind, Geo's when it has none
  element?: Element;
  // The open tab, whose frame each Geo tint is sampled from
  tab: CharacterMenuTab;
}

const { element = Element.Geo, tab } = defineProps<Props>();
</script>

<template>
  <!-- The scene the game shows its character screen over, the element's nebula with the character standing in it, which
       the world stands in for with a tint behind the screen's interface -->
  <div
    class="scene"
    :data-element="element"
    :data-tab="tab"
    :style="{ '--nebula-centre': ElementNebulaMap[element].centre, '--nebula-edge': ElementNebulaMap[element].edge }"
  />
</template>

<style scoped>
/* Every element's nebula is its tint at the centre and at the edge, from ElementNebulaMap. Geo's tabs are sampled from
   their own reference frames as four stops over the frame's height, the median of six bands across the frame's full width,
   less the head band and the foot (y 124 to 1260 of the 3440 by 1440 frame), so they hold for Geo alone. Rock is Geo's
   spelling in the game's tables */
.scene {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 55%, var(--nebula-centre), var(--nebula-edge));
}

.scene[data-element="Rock"][data-tab="Artifacts"] {
  background: linear-gradient(rgb(120 98 40) 0%, rgb(125 107 43) 33%, rgb(157 135 60) 67%, rgb(176 155 74) 100%);
}

.scene[data-element="Rock"][data-tab="Attributes"] {
  background: linear-gradient(rgb(116 86 38) 0%, rgb(128 102 47) 33%, rgb(174 152 75) 67%, rgb(153 130 63) 100%);
}

.scene[data-element="Rock"][data-tab="Constellation"] {
  background: linear-gradient(rgb(51 32 27) 0%, rgb(59 40 28) 33%, rgb(73 55 30) 67%, rgb(89 70 33) 100%);
}

.scene[data-element="Rock"][data-tab="Talents"] {
  background: linear-gradient(rgb(118 96 40) 0%, rgb(118 97 40) 33%, rgb(157 135 61) 67%, rgb(176 154 75) 100%);
}

.scene[data-element="Rock"][data-tab="Weapons"] {
  background: linear-gradient(rgb(126 103 42) 0%, rgb(126 97 43) 33%, rgb(168 145 68) 67%, rgb(168 145 69) 100%);
}
</style>
