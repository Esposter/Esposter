<script setup lang="ts">
import type { ExpeditionCharacter } from "#src/models/ExpeditionCharacter";
import type { ExpeditionNation } from "#src/models/ExpeditionNation";
import type { ExpeditionPin } from "#src/models/ExpeditionPin";
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import CloseButton from "#src/components/CloseButton/Index.vue";
import Action from "#src/components/ExpeditionScreen/Action/Index.vue";
import Detail from "#src/components/ExpeditionScreen/Detail/Index.vue";
import Nations from "#src/components/ExpeditionScreen/Nations/Index.vue";
import Picker from "#src/components/ExpeditionScreen/Picker/Index.vue";
import Pins from "#src/components/ExpeditionScreen/Pins/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GAME_CREAM } from "#src/services/constants";

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
  // The duration picked, in hours, which a send to the picked place takes
  hours: number;
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
const isPicking = defineModel<boolean>("isPicking", { default: false });
defineProps<Props>();
const emit = defineEmits<{
  claim: [placeId: number];
  close: [];
  recall: [placeId: number];
  send: [placeId: number, characterId: number, hours: number];
  "update:hours": [hours: number];
}>();
</script>

<template>
  <!-- The Expedition screen as the public clip shows it at 1080 high (references/expedition-screen, 26 seconds): the title
       across the head with the expedition limit and the way out, the nations down the left, the places as pins over the
       map, and the picked place's panel on the right with its rewards, its durations and the button that acts on it. The
       map is drawn over the world and is the game's art, which does not ship, so the screen is transparent there; the
       panel's picture is drawn as a plain sheet, and the picked pin's brackets as four corners -->
  <div class="expedition-screen">
    <span class="emblem" aria-hidden="true" />
    <ScreenTitle class="heading">{{ title }}</ScreenTitle>
    <p class="limit">{{ limitLabel }}</p>
    <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <Nations v-model:nation="nation" :nations />
    <Pins v-model:place="place" :pins />
    <Detail
      v-if="detail"
      :detail
      :hours
      :rewards-label
      @update:hours="(durationHours) => emit('update:hours', durationHours)"
    />
    <Picker
      v-if="isPicking && detail"
      v-model:is-picking="isPicking"
      :character-title
      :characters
      :detail
      :hours
      @send="(placeId, characterId, durationHours) => emit('send', placeId, characterId, durationHours)"
    />
    <Action
      v-if="detail"
      v-model:is-picking="isPicking"
      :detail
      @claim="(placeId) => emit('claim', placeId)"
      @recall="(placeId) => emit('recall', placeId)"
    />
  </div>
</template>

<style scoped>
.expedition-screen {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: v-bind(GAME_CREAM);
  font-weight: 600;
}

/* The way-out emblem in the head is a white map pin over an open book, both drawn in plain shapes at the reference's place */
.emblem {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 55);
  width: calc(var(--unit) * 43);
  height: calc(var(--unit) * 50);
}

.emblem::before {
  position: absolute;
  top: calc(var(--unit) * 2);
  left: calc(var(--unit) * 8);
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
  border-radius: 50% 50% 50% 0;
  background: #f4f2ee;
  content: "";
  transform: rotate(-45deg);
}

.emblem::after {
  position: absolute;
  top: calc(var(--unit) * 25);
  left: 0;
  width: calc(var(--unit) * 43);
  height: calc(var(--unit) * 24);
  background: #f4f2ee;
  clip-path: polygon(0 35%, 46% 15%, 50% 30%, 54% 15%, 100% 35%, 100% 100%, 54% 80%, 50% 95%, 46% 80%, 0 100%);
  content: "";
}

/* The title is the game's head line at 28 pixels, set in the game's place for it */
.heading {
  font-size: calc(var(--unit) * 28);
}

/* The limit's cap height is the game's, and its face sets narrower, so the letters are spaced out to the game's line width */
.limit {
  position: absolute;
  top: calc(var(--unit) * 33);
  right: calc(var(--unit) * 162);
  margin: 0;
  color: #f7f4ee;
  font-size: calc(var(--unit) * 24);
  letter-spacing: calc(var(--unit) * 1.5);
}

/* The way out's disc is 58 across with a grey ring, drawn inside it so the shared mark keeps the disc's box, and its cross is
   the shared close button's mark in the ink's colour */
.close {
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #757274;
  background: #eee9e8;
  color: #3e4251;
}
</style>
