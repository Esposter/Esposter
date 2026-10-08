<script setup lang="ts">
interface Props {
  // Each of the character's five artifact slots, in the game's order, true where an artifact is worn
  equipped: boolean[];
}

const { equipped } = defineProps<Props>();
</script>

<template>
  <!-- The Artifacts tab's panel: the five artifact slots, each a disc lit where the character wears one, then the set
       bonus block and the two buttons beneath. Its words and the set's text are not drawn yet -->
  <div class="artifacts">
    <ul class="slots">
      <li v-for="(isEquipped, index) in equipped" :key="index" class="slot" :class="{ worn: isEquipped }" />
    </ul>
    <div class="details" />
    <div class="set-bonus" />
    <div class="buttons">
      <span class="button" />
      <span class="button" />
    </div>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Artifacts tab at 21:9, its settled frame at 157.5 seconds of session-2.mp4 (the
   registered reference for it), in units from the panel's top: the details pill at 163, the set bonus block from 227
   to 829 and the buttons at 859. The slots are drawn in the panel's top, which the game draws in the scene. Colours are
   provisional */
.artifacts {
  position: absolute;
  inset: 0;
  color: #fff;
}

.slots {
  position: absolute;
  top: calc(var(--unit) * 15);
  right: 0;
  left: 0;
  display: flex;
  margin: 0;
  padding: 0;
  gap: calc(var(--unit) * 10);
  list-style: none;
}

.slot {
  flex: 1;
  height: calc(var(--unit) * 40);
  border-radius: 50%;
  background: rgb(0 0 0 / 0.2);
}

.slot.worn {
  background: rgb(255 240 180 / 0.55);
  box-shadow: 0 0 calc(var(--unit) * 8) rgb(255 240 180 / 0.6);
}

.details {
  position: absolute;
  top: calc(var(--unit) * 163);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 42);
  border-radius: calc(var(--unit) * 21);
  background: rgb(0 0 0 / 0.2);
}

.set-bonus {
  position: absolute;
  top: calc(var(--unit) * 227);
  right: 0;
  bottom: calc(var(--unit) * 80);
  left: 0;
  background: rgb(0 0 0 / 0.1);
}

.buttons {
  position: absolute;
  top: calc(var(--unit) * 859);
  right: 0;
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 23);
}

.button {
  flex: 1;
  height: calc(var(--unit) * 52);
  border-radius: calc(var(--unit) * 26);
  background: rgb(236 229 216 / 0.85);
}
</style>
