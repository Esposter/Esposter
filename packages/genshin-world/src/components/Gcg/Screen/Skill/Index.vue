<script setup lang="ts">
import type { GcgCost } from "#src/models/gcg/GcgCost";

import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";

interface Props {
  // The costs the skill takes to use, whose dice its token shows
  costs: GcgCost[];
  // Whether the skill cannot be used at this moment
  isDisabled: boolean;
}

const { costs, isDisabled } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <!-- A skill coin of the active character, its dice cost in a token beneath it -->
  <button class="skill" :disabled="isDisabled" type="button" @click="emit('select')">
    <span class="skill-cost">{{ countGcgDiceCost(costs) }}</span>
  </button>
</template>

<style scoped>
.skill {
  position: relative;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 94);
  border: calc(var(--unit) * 4) solid #6e5238;
  border-radius: 50%;
  background: #8e7154;
  color: #f6e3a1;
  cursor: inherit;
}

.skill-cost {
  position: absolute;
  top: calc(var(--unit) * 104);
  left: 50%;
  display: grid;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  place-items: center;
  transform: translateX(-50%);
  border-radius: calc(var(--unit) * 6);
  background: #7b5bb0;
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 700;
}
</style>
