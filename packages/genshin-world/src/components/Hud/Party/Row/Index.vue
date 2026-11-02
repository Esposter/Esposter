<script setup lang="ts">
import type { Party } from "#src/models/party/Party";
import type { Input, InputAction } from "genshin-engine";

import HudKeyCap from "#src/components/Hud/KeyCap/Index.vue";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import {
  GAME_ROW_HOVER,
  GAME_ROW_PRESS,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "genshin-interface/constants";

interface Props {
  // The input action the row's slot's key taps
  action: InputAction;
  // The member the row shows, whose health and whether it is down the row reads
  characterId: number;
  // The row's slot in the deployed team, the member on the field being the one at the active index
  index: number;
  input: Input;
  // Whether the rows are laid out for a touch screen, which caps no row with its key
  isTouch: boolean;
  // The name the row shows, the game's own words while none is chosen
  name: string;
  party: Party;
  // The share of the switch's cooldown left, which darkens every row but the one on the field
  switchCooldownShare: number;
}

const { action, characterId, index, input, isTouch, name, party, switchCooldownShare } = defineProps<Props>();
</script>

<template>
  <!-- A member's row in the deployed team: the name over its HP bar before a round portrait and, for the keys, its slot's
       Key. The member on the field has its name and portrait stand forward on a band, and no bar, its health being the
       HUD's own; a member who is down is greyed, and every other row darkens by the share of the switch's cooldown left.
       A press taps its slot's key, as the number keys do -->
  <button
    class="member"
    :class="{ active: index === party.activeIndex, down: checkIsCharacterDown(party, characterId) }"
    :style="{
      '--health': getPartyMember(party, characterId).healthShare,
      '--shade': index === party.activeIndex ? 0 : switchCooldownShare,
    }"
    type="button"
    @click="tapActionKey(input, action)"
  >
    <span class="details">
      <span class="name">{{ name }}</span>
      <span v-if="index !== party.activeIndex" class="hp" aria-hidden="true"><span class="fill" /></span>
    </span>
    <span class="portrait" aria-hidden="true" />
    <HudKeyCap v-if="!isTouch" class="key" aria-hidden="true" :code="getActionKeyCode(action)" />
  </button>
</template>

<style scoped>
.member {
  position: relative;
  display: flex;
  isolation: isolate;
  align-items: center;
  padding: 0 calc(var(--unit) * 33) 0 0;
  border: none;
  background: none;
  color: #fff;
  cursor: inherit;
  font: inherit;
  gap: calc(var(--unit) * 19);
  pointer-events: auto;
  filter: grayscale(var(--grey, 0)) brightness(calc(1 - var(--shade, 0) * 0.6));
  text-align: end;
  text-shadow: 0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.6);
}

.touch .member {
  padding-right: calc(var(--canvas-unit) * 50);
  gap: calc(var(--canvas-unit) * 9);
}

/* The member on the field's name and portrait step forward, its cap staying in line with the rest */
.active .details,
.active .portrait {
  translate: calc(var(--unit) * -20) 0;
}

/* The band under the member on the field, reaching the container's right edge */
.active::before {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: -1;
  width: calc(var(--unit) * 290);
  height: calc(var(--unit) * 40);
  background: linear-gradient(to right, transparent, rgb(255 255 255 / 0.18) 40%);
  content: "";
  translate: 0 -50%;
}

/* A row lit as the game's Row is, a tint laid over its own box and behind its words: hovered or focused, and a stronger
   one pressed. Provisional, as no recording shows a party row lit. The member on the field's band is its ::before */
.member::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: v-bind(GAME_ROW_HOVER);
  opacity: 0;
  pointer-events: none;
  transition: opacity v-bind(INTERACTION_REST_DURATION);
}

.member:is(:focus-visible, [data-interaction-state="Hover"] *)::after {
  opacity: 1;
  transition-duration: v-bind(INTERACTION_HOVER_DURATION);
}

@media (hover: hover) {
  .member:hover::after {
    opacity: 1;
    transition-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.member:is(:active, [data-pressed], [data-interaction-state="Pressed"] *)::after {
  background-color: v-bind(GAME_ROW_PRESS);
  opacity: 1;
  transition-duration: 0s;
}

.down {
  --grey: 1;
}

.details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--unit) * 6);
}

.name {
  max-width: calc(var(--unit) * 200);
  overflow: hidden;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The pointer after the name of the member on the field, toward the left */
.active .name::after {
  display: inline-block;
  margin-left: calc(var(--unit) * 4);
  border-width: calc(var(--unit) * 5) calc(var(--unit) * 7) calc(var(--unit) * 5) 0;
  border-style: solid;
  border-color: transparent #fff transparent transparent;
  content: "";
  filter: drop-shadow(0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.6));
  vertical-align: middle;
}

.hp {
  display: block;
  width: calc(var(--unit) * 69);
  height: calc(var(--unit) * 5);
  overflow: hidden;
  border-radius: calc(var(--unit) * 2.5);
  background: rgb(0 0 0 / 0.4);
}

.touch .hp {
  width: calc(var(--canvas-unit) * 58);
}

.fill {
  display: block;
  width: calc(var(--health) * 100%);
  height: 100%;
  background: #93d621;
}

.portrait {
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  flex-shrink: 0;
  border: calc(var(--unit) * 2) solid rgb(236 229 216 / 0.85);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #6b7b93, #2c3443);
}

.key {
  margin-left: calc(var(--unit) * 2);
}

.active .key {
  opacity: 0.45;
}
</style>
