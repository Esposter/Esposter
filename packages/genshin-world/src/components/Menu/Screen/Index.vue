<script setup lang="ts">
import type { ProfileNamecard } from "#src/models/profile/ProfileNamecard";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import MenuPaimon from "#src/components/Menu/Paimon/Index.vue";
import MenuPlaceholder from "#src/components/Menu/Placeholder/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { checkIsNpcScreenKind } from "#src/services/screen/checkIsNpcScreenKind";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";

interface Props {
  // The signed-in account's avatar and name, which the profile card shows over the Traveler's when the player is signed in
  accountAvatarUrl?: string;
  accountName?: string;
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level can be lowered or restored now, and whether it is lowered
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // The namecard the player equipped, 0 for none, and the held namecards the profile can show
  namecardItemId: number;
  namecards: ProfileNamecard[];
  // The Traveler's birthday once it is set, which the profile card shows and its setter sets once
  travelerBirthday?: TravelerBirthdaySave;
  // The server's clock minus this machine's, which the World Level's cooldown is read against
  serverClockOffsetMs?: number;
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

// Each built screen, by its kind, as its host draws it with what it needs and closes it by setting the world back
const slots = defineSlots<Partial<Record<TitledScreenKind, () => VNode>>>();
const screenKind = defineModel<ScreenKind>("screenKind", { required: true });
const { gameText } = defineProps<Props>();
const emit = defineEmits<{
  pickNamecard: [itemId: number];
  quit: [];
  setBirthday: [birthday: TravelerBirthdaySave];
  toggleWorldLevel: [];
}>();
</script>

<template>
  <!-- The screen open over the world: the Paimon menu, a built screen its host draws, or the placeholder of one the
       World does not have yet under its title, every one closing back to the world -->
  <MenuPaimon
    v-if="screenKind === ScreenKind.PaimonMenu"
    :account-avatar-url
    :account-name
    :adventure-exp-progress
    :adventure-rank
    :check-is-built="(titledScreenKind) => Boolean(slots[titledScreenKind])"
    :game-text
    :is-world-level-adjustable
    :is-world-level-lowered
    :namecard-item-id
    :namecards
    :traveler-birthday
    :server-clock-offset-ms
    :world-level
    :world-level-changed-at
    @close="screenKind = ScreenKind.World"
    @open="(titledScreenKind) => (screenKind = titledScreenKind)"
    @pick-namecard="(itemId) => emit('pickNamecard', itemId)"
    @quit="emit('quit')"
    @set-birthday="(birthday) => emit('setBirthday', birthday)"
    @toggle-world-level="emit('toggleWorldLevel')"
  />
  <slot
    v-else-if="
      screenKind !== ScreenKind.World &&
      screenKind !== ScreenKind.Dialogue &&
      screenKind !== ScreenKind.GameOver &&
      !checkIsNpcScreenKind(screenKind) &&
      slots[screenKind]
    "
    :name="screenKind"
  />
  <MenuPlaceholder
    v-else-if="
      screenKind !== ScreenKind.World &&
      screenKind !== ScreenKind.Dialogue &&
      screenKind !== ScreenKind.GameOver &&
      !checkIsNpcScreenKind(screenKind)
    "
    :game-text
    :title="gameText[ScreenKindGameTextKeyMap[screenKind]]"
    @close="screenKind = ScreenKind.World"
  />
</template>
