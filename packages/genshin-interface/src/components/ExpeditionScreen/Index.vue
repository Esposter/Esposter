<script setup lang="ts">
import type { ExpeditionNation } from "#src/models/ExpeditionNation";
import type { ExpeditionPin } from "#src/models/ExpeditionPin";
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";

import ItemTile from "#src/components/ItemTile/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";

interface Props {
  // The way out of the screen in the reader's language, read to assistive technology in place of its cross
  closeLabel: string;
  // The picked place: its name, its description, the rewards it may pay, the durations it offers and the action its
  // Button takes. Absent while no place is picked, so the panel and its button are not drawn
  detail?: ExpeditionPlaceDetail;
  // The expedition limit in the reader's words, its count filled in: "Expedition Limit: 1/2"
  limitLabel: string;
  // The nations down the left in the game's order, the picked one drawn larger
  nations: ExpeditionNation[];
  // The places as pins over the map, each at its position in the frame
  pins: ExpeditionPin[];
  // The heading over the picked place's rewards in the reader's language
  rewardsLabel: string;
  // The title the game shows across the head
  title: string;
}

const nation = defineModel<string>("nation", { required: true });
const place = defineModel<number | undefined>("place");
const hours = defineModel<number>("hours", { default: 0 });
const { closeLabel, detail, limitLabel, nations, pins, rewardsLabel, title } = defineProps<Props>();
const emit = defineEmits<{
  claim: [placeId: number];
  close: [];
  recall: [placeId: number];
  send: [placeId: number, hours: number];
}>();

// The picked place's button acts on that place: a send takes the duration picked, a claim or a recall takes the place
const act = () => {
  if (!detail) return;
  if (detail.actionKind === ExpeditionActionKind.Send) emit("send", detail.id, hours.value);
  else if (detail.actionKind === ExpeditionActionKind.Claim) emit("claim", detail.id);
  else emit("recall", detail.id);
};
</script>

<template>
  <!-- The Expedition screen as the public clip shows it at 1080 high (references/expedition-screen, 26 seconds): the title
       across the head with the expedition limit and the way out, the nations down the left, the places as pins over the
       map, and the picked place's panel on the right with its rewards, its durations and the button that acts on it. The
       map and the panel's picture are the game's art and do not ship, so they are drawn as plain sheets, and the pin's
       brackets as a square outline; the parity compares them against the frame -->
  <div class="expedition-screen">
    <div class="map" aria-hidden="true" />
    <ScreenTitle>{{ title }}</ScreenTitle>
    <p class="limit">{{ limitLabel }}</p>
    <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">×</button>
    <ul class="nations">
      <li v-for="{ hasAlert, name } of nations" :key="name">
        <button class="nation" :aria-pressed="name === nation" type="button" @click="nation = name">
          <span class="marker" aria-hidden="true" />
          <span>{{ name }}</span>
          <span v-if="hasAlert" class="alert" aria-hidden="true">!</span>
        </button>
      </li>
    </ul>
    <ul class="pins">
      <li v-for="{ id, label, x, y } of pins" :key="id" :style="{ '--x': x, '--y': y }">
        <button class="pin" :aria-label="label" :aria-pressed="id === place" type="button" @click="place = id">
          <span aria-hidden="true">+</span>
        </button>
      </li>
    </ul>
    <section v-if="detail" class="detail">
      <p class="detail-name">{{ detail.name }}</p>
      <div class="picture" aria-hidden="true" />
      <p class="description">{{ detail.description }}</p>
      <p class="rewards-label">{{ rewardsLabel }}</p>
      <ul class="rewards">
        <li v-for="({ countLabel, label, rarity }, index) of detail.rewards" :key="index">
          <ItemTile class="item" :aria-label="label" :count="countLabel" :rarity role="img" />
        </li>
      </ul>
      <ul class="durations">
        <li v-for="duration of detail.durations" :key="duration">
          <button :aria-pressed="duration === hours" type="button" @click="hours = duration">{{ duration }}h</button>
        </li>
      </ul>
    </section>
    <button v-if="detail" class="action" type="button" @click="act">
      <span class="ring" aria-hidden="true" />
      <span>{{ detail.actionLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.expedition-screen {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #ece5d8;
  font-weight: 600;
}

.map {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 45%, #e4d9c0, #b8a683 70%, #8e7f63);
}

.limit {
  position: absolute;
  top: calc(var(--unit) * 33);
  right: calc(var(--unit) * 162);
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 20);
  right: calc(var(--unit) * 50);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 10);
  background: #f2efe6;
  color: #3b4255;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  line-height: calc(var(--unit) * 56);
}

.nations {
  position: absolute;
  top: calc(var(--unit) * 135);
  left: calc(var(--unit) * 70);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 20);
  margin: 0;
  padding: 0;
  list-style: none;
}

.nation {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 12);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  text-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 4) rgb(0 0 0 / 0.5);
}

.nation[aria-pressed="true"] {
  font-size: calc(var(--unit) * 38);
}

.marker {
  width: calc(var(--unit) * 12);
  height: calc(var(--unit) * 12);
  flex: none;
  background: currentcolor;
  transform: rotate(45deg);
}

.alert {
  display: inline-flex;
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #d8473a;
  color: #fff;
  font-size: calc(var(--unit) * 16);
}

/* Each pin is a circle 80 across standing on its place, its point under it, the picked one outlined as the game brackets it */
.pins {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pins li {
  position: absolute;
  left: calc(var(--unit) * var(--x));
  top: calc(var(--unit) * var(--y));
}

.pin {
  position: absolute;
  top: calc(var(--unit) * -40);
  left: calc(var(--unit) * -40);
  width: calc(var(--unit) * 80);
  height: calc(var(--unit) * 80);
  padding: 0;
  border: calc(var(--unit) * 4) solid #dcd5c4;
  border-radius: 50%;
  background: #f7f4ec;
  color: #6f6a58;
  font: inherit;
  font-size: calc(var(--unit) * 48);
  line-height: calc(var(--unit) * 72);
  box-shadow: 0 calc(var(--unit) * 4) calc(var(--unit) * 8) rgb(0 0 0 / 0.3);
}

.pin::after {
  position: absolute;
  top: 100%;
  left: 50%;
  border: calc(var(--unit) * 10) solid transparent;
  border-top-color: #dcd5c4;
  content: "";
  transform: translateX(-50%);
}

.pin[aria-pressed="true"] {
  outline: calc(var(--unit) * 3) solid #fff;
  outline-offset: calc(var(--unit) * 22);
}

/* The panel at 1445 from the left and 120 from the top, 432 wide and 598 high, its children placed from its corner */
.detail {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 1445);
  width: calc(var(--unit) * 432);
  height: calc(var(--unit) * 598);
  margin: 0;
  background: #e8e3d6;
  color: #3b4255;
  box-shadow: 0 0 calc(var(--unit) * 12) rgb(0 0 0 / 0.35);
}

.detail-name {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 25);
  height: calc(var(--unit) * 52);
  margin: 0;
  color: #d8c8a0;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 52);
}

.detail::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 52);
  background: #4b5165;
  content: "";
}

.picture {
  position: absolute;
  top: calc(var(--unit) * 52);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 158);
  background: linear-gradient(#9fc3d3, #7ea9a0 40%, #6f8f5c 70%, #5b7650);
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
  font-size: calc(var(--unit) * 21);
  font-weight: 400;
  line-height: calc(var(--unit) * 26);
}

.rewards-label {
  position: absolute;
  top: calc(var(--unit) * 389);
  left: calc(var(--unit) * 29);
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 28);
}

.rewards {
  position: absolute;
  top: calc(var(--unit) * 428);
  left: calc(var(--unit) * 29);
  display: flex;
  gap: calc(var(--unit) * 15);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: block;
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
}

.durations {
  position: absolute;
  top: calc(var(--unit) * 527);
  right: 0;
  left: 0;
  display: flex;
  height: calc(var(--unit) * 69);
  margin: 0;
  padding: 0;
  background: #4b5165;
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
  color: #f3eee3;
  font: inherit;
  font-size: calc(var(--unit) * 26);
}

.durations button[aria-pressed="true"] {
  background: #6b7289;
}

.action {
  position: absolute;
  top: calc(var(--unit) * 990);
  left: calc(var(--unit) * 1570);
  display: flex;
  width: calc(var(--unit) * 306);
  height: calc(var(--unit) * 60);
  align-items: center;
  gap: calc(var(--unit) * 12);
  padding: 0 calc(var(--unit) * 22);
  border: none;
  border-radius: calc(var(--unit) * 30);
  background: rgb(24 26 34 / 0.9);
  color: #fff;
  font: inherit;
  font-size: calc(var(--unit) * 26);
}

.ring {
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  flex: none;
  border: calc(var(--unit) * 4) solid #e3c77a;
  border-radius: 50%;
}
</style>
