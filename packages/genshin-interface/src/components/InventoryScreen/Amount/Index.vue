<script setup lang="ts">
interface Props {
  // The slider's name for assistive tech, the game's "Amount to use" line in the reader's language
  amountLabel: string;
  // The most the slider takes, the count of the entry the Use eats from
  amountMaximum: number;
}

const amount = defineModel<number>("amount", { required: true });
const { amountLabel, amountMaximum } = defineProps<Props>();
</script>

<template>
  <div class="amount-picker">
    <input v-model.number="amount" :aria-label="amountLabel" class="amount" :max="amountMaximum" min="1" type="range" />
    <p class="amount-value">{{ amount }}</p>
  </div>
</template>

<style scoped>
/* The number beside the slider, in the game's 26 units, its line standing on the slider's centre. The piece's place
   Is its parent's, which sets the root's position and size */
.amount-value {
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 30);
}

.amount-picker {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 10);
}

.amount {
  width: calc(var(--unit) * 190);
}

.amount::-webkit-slider-runnable-track {
  background: #4d5063;
}

.amount::-webkit-slider-thumb {
  background: #ece3d8;
}
</style>

<style scoped src="../../../styles/craftingShop.css"></style>
