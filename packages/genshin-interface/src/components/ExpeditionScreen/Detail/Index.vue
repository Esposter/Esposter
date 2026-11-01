<script setup lang="ts">
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import GameButton from "#src/components/GameButton/Index.vue";
import ItemTile from "#src/components/ItemTile/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The picked place: its name, its description, the rewards it may pay, the durations it offers and its status
  detail: ExpeditionPlaceDetail;
  // The duration picked, in hours, which a send to the picked place takes
  hours: number;
  // The heading over the picked place's rewards in the reader's language
  rewardsLabel: string;
}

const emit = defineEmits<{ "update:hours": [hours: number] }>();
const { detail, hours, rewardsLabel } = defineProps<Props>();
</script>

<template>
  <section class="detail">
    <p class="detail-name">{{ detail.name }}</p>
    <div class="picture" aria-hidden="true" />
    <p class="description">{{ detail.description }}</p>
    <p class="rewards-label">{{ rewardsLabel }}</p>
    <ul class="rewards">
      <li v-for="({ countLabel, label, rarity }, index) of detail.rewards" :key="index">
        <ItemTile class="item" :aria-label="label" :count="countLabel" count-size="26.67cqh" :rarity role="img" />
      </li>
    </ul>
    <p v-if="detail.statusLabel" class="status">{{ detail.statusLabel }}</p>
    <ul v-else class="durations">
      <li v-for="{ hours: durationHours, label } of detail.durations" :key="durationHours">
        <GameButton
          :aria-pressed="durationHours === hours"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('update:hours', durationHours)"
        >
          {{ label }}
        </GameButton>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* The panel at 1445 from the left and 120 from the top, 432 wide and 598 high, its children placed from its corner */
.detail {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 1445);
  width: calc(var(--unit) * 432);
  height: calc(var(--unit) * 598);
  margin: 0;
  background: #e1d9cb;
  color: #3b4255;
  box-shadow: 0 0 calc(var(--unit) * 12) rgb(0 0 0 / 0.35);
}

/* The name's cap height is 21 and its baseline 36 below the panel's top, so it is set at 28 and spaced out to the reference's width */
.detail-name {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 25);
  height: calc(var(--unit) * 52);
  margin: 0;
  color: #d8c8a0;
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 1.8);
  line-height: calc(var(--unit) * 60);
}

.detail::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 52);
  background: #3e4656;
  content: "";
}

/* The rule under the description is a hairline 20 in from each side of the panel, at 379 below its top */
.detail::after {
  position: absolute;
  top: calc(var(--unit) * 379);
  right: calc(var(--unit) * 20);
  left: calc(var(--unit) * 20);
  height: calc(var(--unit) * 1);
  background: #b9b2a4;
  content: "";
}

.picture {
  position: absolute;
  top: calc(var(--unit) * 52);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 158);
  background: linear-gradient(
    #a2aeb4,
    #a5b5b7 9%,
    #a4bcc4 16%,
    #8b9897 24%,
    #6f8488 32%,
    #5e6c62 39%,
    #56685f 47%,
    #7c8a5c 54%,
    #7c854e 62%,
    #5a664c 70%,
    #686e4a 77%,
    #60644c 85%,
    #7c7c52 92%,
    #6a6755 98%
  );
}

.description {
  position: absolute;
  top: calc(var(--unit) * 210);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 160);
  margin: 0;
  padding: calc(var(--unit) * 14) calc(var(--unit) * 25) 0;
  overflow: hidden;
  box-sizing: border-box;
  color: #625c5c;
  font-size: calc(var(--unit) * 24);
  font-weight: 500;
  line-height: calc(var(--unit) * 26);
}

.rewards-label {
  position: absolute;
  top: calc(var(--unit) * 389);
  left: calc(var(--unit) * 29);
  margin: 0;
  color: #625c5c;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.rewards {
  position: absolute;
  top: calc(var(--unit) * 428);
  left: calc(var(--unit) * 29);
  display: flex;
  gap: calc(var(--unit) * 16);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A reward tile is 75 across; its count's digits have 14 pixels of ink, a font of about 20 pixels */
.item {
  display: block;
  width: calc(var(--unit) * 75);
  height: calc(var(--unit) * 75);
}

.status {
  position: absolute;
  top: calc(var(--unit) * 527);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 69);
  margin: 0;
  background: #d9a441;
  color: #fff;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 69);
  text-align: center;
}

.durations {
  position: absolute;
  top: calc(var(--unit) * 527);
  right: calc(var(--unit) * 5);
  left: calc(var(--unit) * 2);
  display: flex;
  height: calc(var(--unit) * 69);
  margin: 0;
  padding: 0 calc(var(--unit) * 23) 0 calc(var(--unit) * 25);
  background: #8f8f91;
  list-style: none;
}

.durations li {
  display: flex;
  flex: 1;
}

.durations button {
  flex: 1;
  padding: 0;
  border: none;
  background: none;
  color: #e6e2dd;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  white-space: nowrap;
}

.durations button[aria-pressed="true"] {
  background: #a5a2a0;
  color: #f7f5f2;
}
</style>
