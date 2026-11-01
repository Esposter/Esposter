<script setup lang="ts">
interface Props {
  // The count under the box's first material, the bag's count of it over what one unit takes, the game's "28 / 2"
  materialCountLabel: string;
  // The box's heading, the game's "Materials"
  materialsBoxLabel: string;
  // The box's support heading, in the game's words
  supportLabel: string;
}

defineProps<Props>();
</script>

<template>
  <section class="materials-box">
    <header class="materials-head">
      <p class="materials-title">{{ materialsBoxLabel }}</p>
      <p class="support-title">{{ supportLabel }}</p>
    </header>
    <span class="slot slot-first" />
    <span class="slot slot-second" />
    <span class="slot slot-third" />
    <p class="material-count">{{ materialCountLabel }}</p>
    <span class="support-portrait" />
  </section>
</template>

<style scoped>
.materials-box {
  top: calc(var(--unit) * 658.2);
  left: calc(var(--unit) * 1025.1);
  width: calc(var(--unit) * 1130);
  height: calc(var(--unit) * 268.2);
  background: rgb(29 56 73 / 0.5);
}
.materials-head {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 48.8);
  background: #464c5f;
}
.materials-head p {
  position: absolute;
  top: calc(var(--unit) * 15.8);
  margin: 0;
  font-size: calc(var(--unit) * 30);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 0.9);
  white-space: nowrap;
}
.materials-title {
  left: calc(var(--unit) * 42.7);
}
.support-title {
  right: calc(var(--unit) * 41.4);
}
.slot {
  position: absolute;
  top: calc(var(--unit) * 79.2);
  height: calc(var(--unit) * 170.7);
  border: calc(var(--unit) * 2.4) solid rgb(255 255 255 / 0.12);
}
.slot-first {
  left: calc(var(--unit) * 163.3);
  width: calc(var(--unit) * 141.4);
  background: #77797d;
}
.slot-second {
  left: calc(var(--unit) * 340.1);
  width: calc(var(--unit) * 134.1);
}
.slot-third {
  left: calc(var(--unit) * 508.3);
  width: calc(var(--unit) * 134.1);
}
.material-count {
  position: absolute;
  top: calc(var(--unit) * 219.4);
  left: calc(var(--unit) * 163.3);
  width: calc(var(--unit) * 141.4);
  margin: 0;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}
.support-portrait {
  position: absolute;
  top: calc(var(--unit) * 79.2);
  left: calc(var(--unit) * 825.2);
  width: calc(var(--unit) * 141.4);
  height: calc(var(--unit) * 170.7);
  background: #c2b094;
}
</style>
