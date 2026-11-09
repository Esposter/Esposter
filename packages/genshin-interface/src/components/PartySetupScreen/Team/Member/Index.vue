<script setup lang="ts">
import type { PartySetupSlot } from "#src/models/PartySetupSlot";

interface Props {
  // The member on the slot: its element's mark, its name and its level, every field empty for an empty slot
  member: PartySetupSlot;
}

defineProps<Props>();
</script>

<template>
  <div v-if="member.levelText" class="plate">
    <span class="name">
      <svg
        v-if="member.elementMarkPath"
        class="element"
        :style="{ fill: member.elementColor }"
        viewBox="0 0 1600 1600"
        aria-hidden="true"
      >
        <path :d="member.elementMarkPath" />
      </svg>
      {{ member.name }}
    </span>
    <span class="level">{{ member.levelText }}</span>
  </div>
  <span v-else class="plus" aria-hidden="true">+</span>
</template>

<style scoped>
.plate {
  position: absolute;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 6) rgb(0 0 0 / 0.6);
}

.element {
  position: relative;
  top: calc(var(--unit) * -2);
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  margin: calc(var(--unit) * -4) 0;
  fill: #eef8ff;
}

.name {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 5);
  font-size: calc(var(--unit) * 26);
  line-height: 1;
}

.level {
  margin-top: calc(var(--unit) * 5);
  margin-left: calc(var(--unit) * 7);
  color: #dce9ff;
  font-size: calc(var(--unit) * 20);
  line-height: 1;
}

.plus {
  position: absolute;
  top: calc(var(--unit) * 480);
  left: calc(50% - var(--unit) * 48);
  display: flex;
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 96);
  align-items: center;
  justify-content: center;
  border: calc(var(--unit) * 2) dashed rgb(255 255 255 / 0.5);
  border-radius: 50%;
  font-size: calc(var(--unit) * 56);
  opacity: 0.6;
}
</style>
