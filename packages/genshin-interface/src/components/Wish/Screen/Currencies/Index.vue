<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";

interface Props {
  // The counts the screen shows over its banner
  currencies: CurrencyCount[];
}

const { currencies } = defineProps<Props>();
const topUpCurrencies = computed(() => currencies.filter(({ isTopUp }) => isTopUp));
const bottomCurrencies = computed(() => currencies.filter(({ isTopUp }) => !isTopUp));
</script>

<template>
  <ul class="currencies currencies-top">
    <li v-for="{ id, name, quantity } of topUpCurrencies" :key="id" class="currency">
      <span class="currency-icon" role="img" :aria-label="name" />
      <span class="currency-count">{{ quantity }}</span>
      <span class="top-up" aria-hidden="true">+</span>
    </li>
  </ul>
  <ul class="currencies currencies-bottom">
    <li v-for="{ id, name, quantity } of bottomCurrencies" :key="id" class="currency">
      <span class="currency-icon" role="img" :aria-label="name" />
      <span class="currency-count">{{ quantity }}</span>
    </li>
  </ul>
</template>

<style scoped>
/* The top-up currency sits in a translucent pill with its own plus, the banner's Fates below at the foot, each a count beside
   its icon. The icons are the game's own art, which cannot ship, so each is a placeholder of its size */
.currencies {
  position: absolute;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 700;
  list-style: none;
}

.currencies-top {
  top: calc(var(--unit) * 27);
  left: calc(var(--unit) * 1487);
}

.currencies-bottom {
  top: calc(var(--unit) * 956.5);
  left: calc(var(--unit) * 68);
  gap: calc(var(--unit) * 47);
}

.currency {
  display: flex;
  height: calc(var(--unit) * 36);
  align-items: center;
  gap: calc(var(--unit) * 15);
}

.currencies-top .currency {
  padding: 0 calc(var(--unit) * 2) 0 calc(var(--unit) * 13);
  border-radius: calc(var(--unit) * 18);
  background: rgb(40 52 68 / 0.55);
}

.currency-icon {
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
}

.top-up {
  display: flex;
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  margin-left: calc(var(--unit) * 14);
  border-radius: 50%;
  background: #fff;
  color: #343744;
  font-size: calc(var(--unit) * 26);
  align-items: center;
  justify-content: center;
}
</style>
