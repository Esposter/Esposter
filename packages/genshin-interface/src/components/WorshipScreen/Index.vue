<script setup lang="ts">
import type { WorshipLevelState } from "#src/models/WorshipLevelState";

import CloseButton from "#src/components/CloseButton/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import Level from "#src/components/WorshipScreen/Level/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The title of the Statue's Blessing the screen switches to, a switch the game's panel draws none of
  blessingTitle: string;
  // The way out of the screen in the reader's language
  closeLabel: string;
  // The Oculi the region holds toward its next level, which an offer reaches the levels they complete with
  heldCount: number;
  // The level the screen shows, the lowest one whose rewards are not yet claimed: its number, the Oculus it takes (none
  // for a level that takes none), the rewards it pays and the state they are in on the Worship Statue
  level: {
    level: number;
    oculus?: { count: number; name: string };
    rewards: { count: number; name: string }[];
    staminaShare: number;
    state: WorshipLevelState;
  };
  // The word the level's number opens with, in the reader's language
  levelLabel: string;
  // The words on the Offer All pill, which offers every Oculus held at once
  offerAllLabel: string;
  // The words on the Offer pill, which offers the Oculi held one at a time
  offerLabel: string;
  // The line set over the count of the Oculi held
  ownedLabel: string;
  // The word the requirement's heading opens with, in the reader's language
  requiredLabel: string;
  // The heading over the rewards the level pays
  rewardsLabel: string;
  // The word the stamina reward opens with, in the reader's language
  staminaLabel: string;
  // The title the game shows at the top left of the panel
  title: string;
}

const {
  blessingTitle,
  closeLabel,
  heldCount,
  level,
  levelLabel,
  offerAllLabel,
  offerLabel,
  ownedLabel,
  requiredLabel,
  rewardsLabel,
  staminaLabel,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ blessing: []; claim: []; close: []; offer: [] }>();
</script>

<template>
  <!-- The Worship Statue's popup as the game draws it: a panel 614 units across on the window's right, 1080 high, showing the
       one level the region is reaching under its emblem, its rewards, the Oculus it takes against the Oculi held, and the two
       offer buttons. The parchment, emblem, icons, padlock and offer arrows are plain until the game's art is recorded. The
       Blessing switch sits off the panel, which draws none -->
  <div class="worship-screen">
    <GameButton class="blessing" :kind="GameButtonKind.Row" tip="" @click="emit('blessing')">
      {{ blessingTitle }}
    </GameButton>
    <div class="panel">
      <div class="head" aria-hidden="true" />
      <div class="emblem" aria-hidden="true">
        <div class="disc">
          <span class="level-label">{{ levelLabel }}</span>
          <span class="level-number">{{ level.level }}</span>
        </div>
      </div>
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <p v-if="level.oculus" class="held-count">{{ level.oculus.name }} {{ heldCount }} / {{ level.oculus.count }}</p>
      <span class="bar" aria-hidden="true" />
      <div class="heading rewards-heading">
        <span class="rule" />
        <span class="words">{{ rewardsLabel }}</span>
        <span class="rule" />
      </div>
      <Level
        class="rewards"
        :rewards="level.rewards"
        :stamina-label
        :stamina-share="level.staminaShare"
        :state="level.state"
        @claim="emit('claim')"
      />
      <template v-if="level.oculus">
        <div class="heading required-heading">
          <span class="rule" />
          <span class="words">{{ requiredLabel }} {{ level.oculus.name }}</span>
          <span class="rule" />
        </div>
        <div class="requirement">
          <span class="requirement-icon" aria-hidden="true" />
          <span class="owned-label">{{ ownedLabel }}</span>
          <span class="owned">× {{ heldCount }}</span>
          <span class="help" aria-hidden="true">?</span>
        </div>
        <GameButton class="offer" :disabled="heldCount === 0" :kind="GameButtonKind.Pill" tip="" @click="emit('offer')">
          <span class="offer-icon" aria-hidden="true" />
          <span class="offer-label">{{ offerLabel }}</span>
        </GameButton>
        <GameButton
          class="offer-all"
          :disabled="heldCount === 0"
          :kind="GameButtonKind.Pill"
          tip=""
          @click="emit('offer')"
        >
          <span class="offer-icon" aria-hidden="true" />
          <span class="offer-label">{{ offerAllLabel }}</span>
        </GameButton>
      </template>
      <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    </div>
  </div>
</template>

<style scoped>
.worship-screen {
  position: absolute;
  inset: 0;
  color: #505350;
}

.blessing {
  position: absolute;
  top: calc(var(--unit) * 19);
  left: calc(var(--unit) * 48);
  padding: calc(var(--unit) * 8) calc(var(--unit) * 18);
  border: none;
  border-radius: calc(var(--unit) * 4);
  background: rgb(20 18 16 / 55%);
  color: #f5f0e6;
  font-size: calc(var(--unit) * 20);
  cursor: inherit;
}

.panel {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(var(--unit) * 614);
  height: calc(var(--unit) * 1080);
  overflow: hidden;
  background: #dfd8c9;
}

.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 96);
  background: #857d67;
}

.emblem {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 228);
  width: calc(var(--unit) * 156);
  height: calc(var(--unit) * 156);
  border-radius: 50%;
  background: #c9c2ad;
}

.disc {
  position: absolute;
  top: calc(var(--unit) * 18);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 120);
  border-radius: 50%;
  background: #eeeadb;
  box-shadow: inset 0 0 0 calc(var(--unit) * 3) #d6c99c;
}

.level-label,
.level-number {
  position: absolute;
  right: 0;
  left: 0;
  font-weight: 600;
  text-align: center;
}

.level-label {
  top: calc(var(--unit) * 25);
  font-size: calc(var(--unit) * 18);
  line-height: calc(var(--unit) * 22);
}

.level-number {
  top: calc(var(--unit) * 48);
  color: #3f4343;
  font-size: calc(var(--unit) * 52);
  line-height: calc(var(--unit) * 56);
}

.title,
.held-count {
  position: absolute;
  top: calc(var(--unit) * 196);
  margin: 0;
  font-size: calc(var(--unit) * 21);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
  white-space: nowrap;
}

.title {
  left: calc(var(--unit) * 37);
}

.held-count {
  right: calc(var(--unit) * 39);
}

.bar {
  position: absolute;
  top: calc(var(--unit) * 229);
  left: calc(var(--unit) * 34);
  width: calc(var(--unit) * 547);
  height: calc(var(--unit) * 10);
  background: #55688a;
  clip-path: polygon(
    0 50%,
    calc(var(--unit) * 6) 0,
    calc(100% - var(--unit) * 6) 0,
    100% 50%,
    calc(100% - var(--unit) * 6) 100%,
    calc(var(--unit) * 6) 100%
  );
}

.heading {
  position: absolute;
  left: calc(var(--unit) * 34);
  display: flex;
  width: calc(var(--unit) * 546);
  align-items: center;
  color: #545954;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
}

.rewards-heading {
  top: calc(var(--unit) * 254);
}

.required-heading {
  top: calc(var(--unit) * 841);
}

.rule {
  flex: 1;
  height: calc(var(--unit) * 2);
  background: #d4cfbe;
}

.words {
  flex: none;
  padding: 0 calc(var(--unit) * 12);
  white-space: nowrap;
}

.rewards {
  position: absolute;
  top: calc(var(--unit) * 296);
  left: calc(var(--unit) * 40);
  width: calc(var(--unit) * 536);
}

.requirement {
  position: absolute;
  top: calc(var(--unit) * 874);
  left: calc(var(--unit) * 40);
  width: calc(var(--unit) * 536);
  height: calc(var(--unit) * 85);
  background: #cdc5b2;
}

.requirement-icon {
  position: absolute;
  top: calc(var(--unit) * 10);
  left: calc(var(--unit) * 11);
  width: calc(var(--unit) * 65);
  height: calc(var(--unit) * 65);
  background: #7b7566;
}

.owned,
.owned-label {
  position: absolute;
  left: calc(var(--unit) * 100);
  color: #5f5b4f;
  font-weight: 600;
}

.owned-label {
  top: calc(var(--unit) * 9);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
}

.owned {
  top: calc(var(--unit) * 34);
  font-size: calc(var(--unit) * 30);
  line-height: calc(var(--unit) * 40);
}

.help {
  position: absolute;
  top: calc(var(--unit) * 23);
  left: calc(var(--unit) * 478);
  display: grid;
  width: calc(var(--unit) * 38);
  height: calc(var(--unit) * 38);
  place-items: center;
  border-radius: 50%;
  background: #ebe6da;
  color: #32352c;
  font-size: calc(var(--unit) * 26);
  font-weight: 700;
  line-height: 1;
}

.offer,
.offer-all {
  position: absolute;
  top: calc(var(--unit) * 991);
  height: calc(var(--unit) * 58);
}

.offer {
  left: calc(var(--unit) * 40);
  width: calc(var(--unit) * 214);
}

.offer-all {
  left: calc(var(--unit) * 307);
  width: calc(var(--unit) * 268);
}

.offer:disabled,
.offer-all:disabled {
  opacity: 0.4;
}

.offer-icon {
  position: absolute;
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 8);
  width: calc(var(--unit) * 42);
  height: calc(var(--unit) * 42);
  border-radius: 50%;
  background: #d9c58f;
}

.offer-all .offer-icon {
  left: calc(var(--unit) * 7);
}

/* Positioned, so the words show over the pill's press light, and drawn at three quarters of the pill's opacity, which fits
   the faint words of the reference's disabled pills */
.offer-label {
  position: absolute;
  top: calc(var(--unit) * 16);
  left: calc(var(--unit) * 84);
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 4);
  white-space: nowrap;
  opacity: 0.75;
}

.panel .close {
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 29);
  background: #e6e2d6;
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #a59f8c;
  color: #2f3133;
}
</style>
