<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Party } from "#src/models/party/Party";
import type { Input } from "genshin-engine";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { PARTY_MEMBER_INPUT_ACTIONS, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";

interface Props {
  // The party's characters' data, whose text id names each row
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The world's frame, whose clock the switch's cooldown counts down by
  frame: HudFrame;
  input: Input;
  // The names the text ids cite in the reader's language, which stay blank until they load
  nameTextMap?: Readonly<Record<string, string>>;
  party: Party;
}

const { characterDataMap, frame, input, nameTextMap, party } = defineProps<Props>();
// The share of the switch's cooldown left, which darkens every row but the one on the field
const switchCooldownShare = computed(() =>
  Math.max(0, 1 - (frame.seconds - party.switchedSeconds) / PARTY_SWITCH_COOLDOWN_SECONDS),
);
const getName = (characterId: number): string => {
  const nameTextId = characterDataMap.get(characterId)?.nameTextId ?? "";
  return nameTextMap?.[nameTextId] || "";
};
// A press on a row presses its slot's key, as the number keys do, and lets it go in the same frame
const pressMemberKey = (index: number) => {
  const inputAction = PARTY_MEMBER_INPUT_ACTIONS[index];
  if (inputAction === undefined) return;
  const code = getActionKeyCode(inputAction);
  input.press(code);
  input.release(code);
};
</script>

<template>
  <!-- The deployed team down the right, a row a member in slot order: its name over an HP bar beside a round portrait,
       and its slot's number. The member on the field is marked, a member who is down greyed, and after a switch every
       other row darkens by the share of the cooldown left -->
  <ol class="party">
    <li v-for="(characterId, index) of party.teams[party.deployedTeamIndex]?.characterIds ?? []" :key="characterId">
      <button
        class="member"
        :class="{ active: index === party.activeIndex, down: checkIsCharacterDown(party, characterId) }"
        :style="{
          '--health': getPartyMember(party, characterId).healthShare,
          '--shade': index === party.activeIndex ? 0 : switchCooldownShare,
        }"
        type="button"
        @click="pressMemberKey(index)"
      >
        <span class="details">
          <span class="name">{{ getName(characterId) }}</span>
          <span class="hp" aria-hidden="true"><span class="fill" /></span>
        </span>
        <span class="portrait" aria-hidden="true" />
      </button>
    </li>
  </ol>
</template>

<style scoped>
/* Provisional: the rows' portraits, HP bars and the mark on the member on the field, the grey of a member who is down and
   the darkening after a switch, measured off a recording of the English PC client's world HUD through a switch. The
   Names sit left of each round portrait, the bar under them, and the rows come on a 119-unit pitch */
.party {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: calc(var(--unit) * 63);
  list-style: none;
}

.member {
  position: relative;
  display: flex;
  width: calc(var(--unit) * 230);
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: inherit;
  font: inherit;
  gap: calc(var(--unit) * 8);
  pointer-events: auto;
  filter: grayscale(var(--grey, 0)) brightness(calc(1 - var(--shade, 0) * 0.6));
  text-align: end;
  text-shadow: 0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.6);
}

.down {
  --grey: 1;
}

.portrait {
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  flex-shrink: 0;
  border: calc(var(--unit) * 2) solid rgb(236 229 216 / 0.85);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #6b7b93, #2c3443);
}

.active .portrait {
  border-color: #ffd43b;
}

.details {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--unit) * 6);
}

.name {
  overflow: hidden;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hp {
  display: block;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 6);
  overflow: hidden;
  border-radius: calc(var(--unit) * 3);
  background: rgb(0 0 0 / 0.4);
}

.fill {
  display: block;
  width: calc(var(--health) * 100%);
  height: 100%;
  background: #8fd14f;
}
</style>
