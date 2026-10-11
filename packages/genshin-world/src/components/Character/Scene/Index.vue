<script setup lang="ts">
import type { CharacterMenuTab } from "genshin-interface";

interface Props {
  // The open tab, whose frame each tint is sampled from
  tab: CharacterMenuTab;
}

const { tab } = defineProps<Props>();
</script>

<template>
  <!-- The scene the game shows its character screen over, the element's nebula with the character standing in it, which
       The world stands in for with a tint behind the screen's interface -->
  <div class="scene" :data-tab="tab" />
</template>

<style scoped>
/* Provisional: each tab's tint is sampled from its own reference frame as four stops over the frame's height, the
   median of six bands across the frame's full width, less the head band and the foot (y 124 to 1260 of the 3440 by 1440
   frame). Profile has no reference frame, so it keeps Geo's radial tint, and each element's own nebula is not built */
.scene {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 55%, rgb(175 149 68), rgb(106 82 36));
}

.scene[data-tab="Artifacts"] {
  background: linear-gradient(rgb(120 98 40) 0%, rgb(125 107 43) 33%, rgb(157 135 60) 67%, rgb(176 155 74) 100%);
}

.scene[data-tab="Attributes"] {
  background: linear-gradient(rgb(116 86 38) 0%, rgb(128 102 47) 33%, rgb(174 152 75) 67%, rgb(153 130 63) 100%);
}

.scene[data-tab="Constellation"] {
  background: linear-gradient(rgb(51 32 27) 0%, rgb(59 40 28) 33%, rgb(73 55 30) 67%, rgb(89 70 33) 100%);
}

.scene[data-tab="Talents"] {
  background: linear-gradient(rgb(118 96 40) 0%, rgb(118 97 40) 33%, rgb(157 135 61) 67%, rgb(176 154 75) 100%);
}

.scene[data-tab="Weapons"] {
  background: linear-gradient(rgb(126 103 42) 0%, rgb(126 97 43) 33%, rgb(168 145 68) 67%, rgb(168 145 69) 100%);
}
</style>
