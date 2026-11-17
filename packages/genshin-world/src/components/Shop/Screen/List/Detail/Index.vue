<script setup lang="ts">
import type { ShopGoodCell } from "genshin-interface";

interface Props {
  // The good the detail shows, with its name, its owned count and its refresh
  good: ShopGoodCell;
  // The heading over where the shown good's item comes from, which its source box sits under
  sourceLabel: string;
}

defineProps<Props>();
</script>

<template>
  <section class="detail" :aria-label="good.name">
    <div class="detail-head">
      <p class="detail-name">{{ good.name }}</p>
    </div>
    <div class="detail-art">
      <span class="detail-picture" />
    </div>
    <div class="detail-body">
      <p class="detail-source-label">{{ sourceLabel }}</p>
      <span class="detail-source" />
    </div>
    <div class="detail-owned">
      <p class="detail-owned-count">{{ good.ownedLabel }}</p>
    </div>
  </section>
</template>

<style scoped>
.detail {
  position: absolute;
  top: calc(var(--unit) * 126);
  left: calc(var(--unit) * 1308);
  width: calc(var(--unit) * 492);
  height: calc(var(--unit) * 834);
}

.detail-head {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: calc(var(--unit) * 54);
  padding: 0 calc(var(--unit) * 28);
  border: calc(var(--unit) * 2) solid #a9b0c0;
  background: rgb(113 118 138);
  color: #f7f2e6;
}

.detail-name {
  margin: 0;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 34);
}

.detail-art {
  position: absolute;
  top: calc(var(--unit) * 54);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 225);
  background: linear-gradient(rgb(115 121 130), rgb(101 106 119));
}

.detail-picture {
  position: absolute;
  top: calc(var(--unit) * 36);
  left: calc(var(--unit) * 312);
  width: calc(var(--unit) * 110);
  height: calc(var(--unit) * 150);
  background: rgb(167 171 177);
}

.detail-body {
  position: absolute;
  top: calc(var(--unit) * 279);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 330);
  background: #ebe5d5;
}

.detail-source-label {
  position: absolute;
  top: calc(var(--unit) * 167);
  left: calc(var(--unit) * 67);
  margin: 0;
  color: #4a5164;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 0.8);
}

.detail-source {
  position: absolute;
  top: calc(var(--unit) * 208);
  left: calc(var(--unit) * 32);
  box-sizing: border-box;
  width: calc(var(--unit) * 428);
  height: calc(var(--unit) * 62);
  border: calc(var(--unit) * 2) solid #cdc4ae;
}

.detail-owned {
  position: absolute;
  top: calc(var(--unit) * 786);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 48);
  background: rgb(254 231 186);
}

.detail-owned-count {
  margin: 0;
  color: #4a5164;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 48);
  letter-spacing: calc(var(--unit) * 0.6);
  text-align: center;
}
</style>
