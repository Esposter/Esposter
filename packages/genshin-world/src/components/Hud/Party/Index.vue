<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Party } from "#src/models/party/Party";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import HudPartyRow from "#src/components/Hud/Party/Row/Index.vue";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsNextMemberAsked } from "#src/services/party/checkIsNextMemberAsked";
import { PARTY_MEMBER_INPUT_ACTIONS, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";
import { GAME_CREAM } from "genshin-interface";
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
      <HudPartyRow
        :action
        :character-id
        :index
        :input
        :is-touch
        :name="getName(characterId)"
        :party
        :switch-cooldown-share
      />
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
   Past it and 33 in from the container's right edge; on touch, no cap, the row's right padding 50 canvas units. A padding of 32
   set each portrait and name about 18 pixels right of `hud-world-pickup` at 934 high, so 50 is fitted to that still.
   The bar 58 wide 9 before the portrait, its left end 173 in. The field member's name and portrait stand 20 units forward.
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
  color: v-bind(GAME_CREAM);
  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
  white-space: nowrap;
}

.touch {
  translate: none;
}

.touch > li {
  height: calc(var(--canvas-unit) * 76);
}
</style>
