<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Party } from "#src/models/party/Party";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import HudKeyCap from "#src/components/Hud/KeyCap/Index.vue";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { checkIsNextMemberAsked } from "#src/services/party/checkIsNextMemberAsked";
import { PARTY_MEMBER_INPUT_ACTIONS, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import { takeOne } from "@esposter/shared";
import { GameTextKey } from "genshin-text";

interface Props {
  // The party's characters' data, whose text id names each row
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The world's frame, whose clock the switch's cooldown counts down by
  frame: HudFrame;
  // The game's own words, which the prompt for the next member is read from
  gameText: GameText;
  input: Input;
  // Whether the rows are laid out for a touch screen, which caps no row with its key
  isTouch: boolean;
  // The names the text ids cite in the reader's language, which stay blank until they load
  nameTextMap?: Readonly<Record<string, string>>;
  party: Party;
  // The name the player chose for the Traveler, shown on the Traveler's row as the game shows it, the game's own name
  // While none is chosen
  travelerName: string;
}

const { characterDataMap, frame, gameText, input, isTouch, nameTextMap, party, travelerName } = defineProps<Props>();
// The share of the switch's cooldown left, which darkens every row but the one on the field
const switchCooldownShare = computed(() =>
  Math.max(0, 1 - (frame.seconds - party.switchedSeconds) / PARTY_SWITCH_COOLDOWN_SECONDS),
);
const getName = (characterId: number): string => {
  if (characterId === TRAVELER_CHARACTER_ID && travelerName) return travelerName;
  const nameTextId = characterDataMap.get(characterId)?.nameTextId ?? "";
  return nameTextMap?.[nameTextId] || "";
};
// The rows, a member each in slot order with the input action its slot's key taps: every deployed member for the keys,
// And on a touch screen all but the member on the field, whose row the mobile client leaves out
const rows = computed(() =>
  getDeployedCharacterIds(party)
    .map((characterId, index) => ({ action: takeOne(PARTY_MEMBER_INPUT_ACTIONS, index), characterId, index }))
    .filter(({ index }) => !isTouch || index !== party.activeIndex),
);
</script>

<template>
  <!-- The deployed team down the right, a row a member in slot order, centred about a fixed point of the game's
       Container for it: the member's name over its HP bar before a round portrait and, for the keys, its slot's key.
       For the keys the member on the field has its name and portrait stand forward on a band, a pointer after the name
       And no bar, its health being the HUD's own; a member who is down is greyed, and after a switch every other row
       Darkens by the share of the cooldown left. A press on a row taps its slot's key, as the number keys do -->
  <ol class="party" :class="{ touch: isTouch }">
    <li v-for="{ action, characterId, index } of rows" :key="characterId">
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
          <span class="name">{{ getName(characterId) }}</span>
          <span v-if="index !== party.activeIndex" class="hp" aria-hidden="true"><span class="fill" /></span>
        </span>
        <span class="portrait" aria-hidden="true" />
        <HudKeyCap v-if="!isTouch" class="key" aria-hidden="true" :code="getActionKeyCode(action)" />
      </button>
    </li>
  </ol>
  <!-- Once the member on the field has fallen and another stands, the game asks for the next one, under the team -->
  <p v-if="checkIsNextMemberAsked(party)" class="prompt">{{ gameText[GameTextKey.PleaseSelectCharacter] }}</p>
</template>

<style scoped>
/* Measured by script off five recordings of the English PC client's keys at 1080 high and four of the mobile client:
   The PC client's rows of one, two and four members centre within a quarter pixel of one another, 71.25 canvas units
   Above `TeamBtnContainer`'s middle, on an 80 unit pitch; the mobile client's centre on its middle, on a 76 unit pitch.
   For the keys, a name 22 units high over a bar 69 by 5, 19 before the portrait, 56 across, and the slot's cap 21
   Past it and 33 in from the container's right edge; on touch, no cap, the portrait centred 60 canvas units in and the
   Bar 58 wide 9 before it, its left end 155 in. The field member's name and portrait stand 20 units forward.
   Provisional: the band and the pointer that mark it, the grey of a member who is down and the darkening after a
   Switch */
.party {
  display: flex;
  height: 100%;
  margin: 0;
  padding: 0;
  flex-direction: column;
  justify-content: center;
  list-style: none;
  translate: 0 calc(var(--canvas-unit) * -71.25);
}

.party > li {
  display: flex;
  height: calc(var(--canvas-unit) * 80);
  justify-content: flex-end;
  align-items: center;
}

/* Provisional: the prompt's place under the team and its look wait on a recording of the English client at 1080 high */
.prompt {
  position: absolute;
  top: 100%;
  right: calc(var(--canvas-unit) * 33);
  margin: 0;
  color: #ece5d8;
  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
  white-space: nowrap;
}

.touch {
  translate: none;
}

.touch > li {
  height: calc(var(--canvas-unit) * 76);
}

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
  padding-right: calc(var(--canvas-unit) * 32);
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
