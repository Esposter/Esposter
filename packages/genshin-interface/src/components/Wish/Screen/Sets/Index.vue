<script setup lang="ts">
import type { WishPurchase } from "#src/models/WishPurchase";
import type { WishSet } from "#src/models/WishSet";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The Fate bought with Primogems, offered as one button beside the sets while the wallet holds too few Fates for a
  // Wish, "[]" otherwise
  purchases: WishPurchase[];
  // The open banner's ×1 and ×10
  sets: WishSet[];
}

const emit = defineEmits<{ buy: []; wish: [count: number] }>();
const { purchases, sets } = defineProps<Props>();
</script>

<template>
  <div class="sets">
    <GameButton
      v-for="{ cost, count, isAffordable, label } of sets"
      :key="count"
      class="set"
      :disabled="!isAffordable"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('wish', count)"
    >
      <span class="set-label">{{ label }}</span>
      <span class="cost">{{ cost }}</span>
    </GameButton>
    <GameButton
      v-for="{ cost, isAffordable, label } of purchases"
      :key="label"
      class="set"
      :disabled="!isAffordable"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('buy')"
    >
      <span class="set-label">{{ label }}</span>
      <span class="cost">{{ cost }}</span>
    </GameButton>
  </div>
</template>

<style scoped>
.sets {
  position: absolute;
  top: calc(var(--unit) * 975);
  left: calc(var(--unit) * 1147);
  display: flex;
  gap: calc(var(--unit) * 33);
}

.sets .set {
  display: flex;
  width: calc(var(--unit) * 340);
  height: calc(var(--unit) * 74);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: calc(var(--unit) * 3) solid #f4f0cb;
  border-radius: calc(var(--unit) * 36);
  background: #fff;
  color: #9d9a9a;
  font-size: calc(var(--unit) * 22);
}

.set-label {
  font-weight: 600;
}

.cost {
  font-size: calc(var(--unit) * 24);
  opacity: 0.85;
}
</style>
