<script setup lang="ts">
import type { ExpeditionCharacter } from "#src/models/ExpeditionCharacter";
import type { ExpeditionNation } from "#src/models/ExpeditionNation";
import type { ExpeditionPin } from "#src/models/ExpeditionPin";
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import ItemTile from "#src/components/ItemTile/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";

interface Props {
  // The characters the picker lists in the game's order, a character away from home shown with its status and not sent
  characters: ExpeditionCharacter[];
  // The picker's heading in the reader's language, the game's "Character Selection"
  characterTitle: string;
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
const picking = defineModel<boolean>("picking", { default: false });
const { characters, characterTitle, closeLabel, detail, limitLabel, nations, pins, rewardsLabel, title } =
  defineProps<Props>();
const emit = defineEmits<{
  claim: [placeId: number];
  close: [];
  recall: [placeId: number];
  send: [placeId: number, characterId: number, hours: number];
}>();

// The picked place's button acts on that place: a send opens the picker of the character it takes, a claim or a recall
// Acts on the place at once
const act = () => {
  if (!detail) return;
  if (detail.actionKind === ExpeditionActionKind.Send) picking.value = true;
  else if (detail.actionKind === ExpeditionActionKind.Claim) emit("claim", detail.id);
  else emit("recall", detail.id);
};
// The character picked sends the place's expedition for the duration picked, and closes the picker
const pick = (characterId: number) => {
  if (!detail) return;
  picking.value = false;
  emit("send", detail.id, characterId, hours.value);
};
</script>

<template>
  <!-- The Expedition screen as the public clip shows it at 1080 high (references/expedition-screen, 26 seconds): the title
       across the head with the expedition limit and the way out, the nations down the left, the places as pins over the
       map, and the picked place's panel on the right with its rewards, its durations and the button that acts on it. The
       map is drawn over the world and is the game's art, which does not ship, so the screen is transparent there; the
       panel's picture is drawn as a plain sheet, and the pin's brackets as a square outline -->
  <div class="expedition-screen">
    <ScreenTitle class="heading">{{ title }}</ScreenTitle>
    <p class="limit">{{ limitLabel }}</p>
    <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')"></button>
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
      <li v-for="{ awayLabel, id, label, x, y } of pins" :key="id" :style="{ '--x': x, '--y': y }">
        <button class="pin" :aria-label="label" :aria-pressed="id === place" type="button" @click="place = id">
          <span class="plus" aria-hidden="true" />
        </button>
        <span v-if="awayLabel" class="away">{{ awayLabel }}</span>
      </li>
    </ul>
    <section v-if="detail" class="detail">
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
          <button :aria-pressed="durationHours === hours" type="button" @click="hours = durationHours">
            {{ label }}
          </button>
        </li>
      </ul>
    </section>
    <section v-if="picking && detail" class="characters">
      <p class="characters-title">{{ characterTitle }}</p>
      <ul>
        <li v-for="{ bonusLabel, id, label, statusLabel } of characters" :key="id">
          <button class="character" :disabled="statusLabel !== ''" type="button" @click="pick(id)">
            <span class="character-name">{{ label }}</span>
            <span class="character-bonus">{{ bonusLabel }}</span>
            <span v-if="statusLabel" class="character-status">{{ statusLabel }}</span>
          </button>
        </li>
      </ul>
    </section>
    <button v-if="detail" class="action" type="button" @click="act()">
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

/* The title is the game's head line at 28 pixels, set in the game's place for it */
.heading {
  font-size: calc(var(--unit) * 28);
}

.limit {
  position: absolute;
  top: calc(var(--unit) * 33);
  right: calc(var(--unit) * 162);
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

/* The way out is a disc 58 across with a grey ring, its cross two bars of the ink's colour, measured from the reference */
.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 48);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  padding: 0;
  box-sizing: border-box;
  border: calc(var(--unit) * 6) solid #757274;
  border-radius: 50%;
  background: #eee9e8;
  color: #3e4251;
}

.close::before,
.close::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 6);
  background: currentcolor;
  content: "";
  transform: translate(-50%, -50%) rotate(45deg);
}

.close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.nations {
  position: absolute;
  top: calc(var(--unit) * 142);
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
  gap: calc(var(--unit) * 34);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 2);
  text-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 4) rgb(0 0 0 / 0.5);
}

.nation[aria-pressed="true"] {
  font-size: calc(var(--unit) * 42);
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

/* The plus is two bars of 36 by 7 in the game's grey, centred on the pin */
.plus {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  background:
    linear-gradient(#9c9ea2, #9c9ea2) center / 100% calc(var(--unit) * 7) no-repeat,
    linear-gradient(#9c9ea2, #9c9ea2) center / calc(var(--unit) * 7) 100% no-repeat;
  transform: translate(-50%, -50%);
}

/* The time left on the expedition away from a place, a dark tag above its pin */
.away {
  position: absolute;
  top: calc(var(--unit) * -110);
  left: 0;
  padding: calc(var(--unit) * 4) calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 14);
  background: rgb(24 26 34 / 0.9);
  color: #fff;
  font-size: calc(var(--unit) * 20);
  transform: translateX(-50%);
  white-space: nowrap;
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
  background: #e1d9cb;
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
  background: #3e4656;
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

/* The picker over the map's left, a row a character with its bonus words and its status when it is away */
.characters {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 960);
  padding: calc(var(--unit) * 40) calc(var(--unit) * 50);
  box-sizing: border-box;
  background: rgb(31 37 54 / 0.96);
  color: #f3eee3;
}

.characters-title {
  margin: 0 0 calc(var(--unit) * 30);
  color: #d8c8a0;
  font-size: calc(var(--unit) * 30);
}

.characters ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.character {
  display: flex;
  width: 100%;
  height: calc(var(--unit) * 120);
  margin-bottom: calc(var(--unit) * 10);
  padding: 0 calc(var(--unit) * 30);
  flex-direction: column;
  justify-content: center;
  border: none;
  border-radius: calc(var(--unit) * 6);
  background: #3b4560;
  color: inherit;
  font: inherit;
  text-align: left;
}

.character:disabled {
  opacity: 0.5;
}

.character-name {
  font-size: calc(var(--unit) * 34);
}

.character-bonus {
  color: #b9c2d6;
  font-size: calc(var(--unit) * 22);
}

.character-status {
  color: #e3c77a;
  font-size: calc(var(--unit) * 22);
}

.durations {
  position: absolute;
  top: calc(var(--unit) * 527);
  right: calc(var(--unit) * 5);
  left: calc(var(--unit) * 2);
  display: flex;
  height: calc(var(--unit) * 69);
  margin: 0;
  padding: 0 calc(var(--unit) * 25) 0 calc(var(--unit) * 20);
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

/* The button is a cream pill 307 by 64, its disc and ring at its left, the words set in the game's dark ink */
.action {
  position: absolute;
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 1570);
  display: flex;
  width: calc(var(--unit) * 307);
  height: calc(var(--unit) * 64);
  align-items: center;
  gap: calc(var(--unit) * 3);
  padding: 0 0 0 calc(var(--unit) * 12);
  border: none;
  border-radius: calc(var(--unit) * 32);
  background: #ece4d8;
  color: #2c313d;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 0.6);
}

/* The disc is 42 across with a gold ring of 22 inside it, both measured from the reference's button */
.ring {
  position: relative;
  width: calc(var(--unit) * 42);
  height: calc(var(--unit) * 42);
  flex: none;
  border-radius: 50%;
  background: #2e3030;
}

.ring::before {
  position: absolute;
  top: calc(var(--unit) * 10);
  left: calc(var(--unit) * 10);
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 22);
  border: calc(var(--unit) * 3) solid #f2c84e;
  border-radius: 50%;
  box-sizing: border-box;
  content: "";
}
</style>
