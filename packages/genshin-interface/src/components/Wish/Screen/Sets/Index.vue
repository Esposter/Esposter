<script setup lang="ts">
import type { WishPurchase } from "#src/models/WishPurchase";
import type { WishSet } from "#src/models/WishSet";

import Item from "#src/components/Wish/Screen/Sets/Item/Index.vue";

interface Props {
  // The Fate bought with Primogems, offered as one button beside the sets while the wallet holds too few Fates for a
  // Wish, "[]" otherwise
  purchases: WishPurchase[];
  // The open banner's ×1 and ×10
  sets: WishSet[];
}

defineProps<Props>();
const emit = defineEmits<{ buy: []; wish: [count: number] }>();
</script>

<template>
  <div class="sets">
    <Item
      v-for="{ cost, count, isAffordable, label } of sets"
      :key="count"
      :cost
      :is-affordable
      :label
      @press="emit('wish', count)"
    />
    <Item
      v-for="{ cost, isAffordable, label } of purchases"
      :key="label"
      :cost
      :is-affordable
      :label
      @press="emit('buy')"
    />
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
</style>
