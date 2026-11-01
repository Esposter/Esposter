<script setup lang="ts">
import type { ProfileNamecard } from "#src/models/menu/ProfileNamecard";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { GameText } from "genshin-text";

import MenuBirthdayDialog from "#src/components/Menu/BirthdayDialog/Index.vue";
import MenuExit from "#src/components/Menu/Exit/Index.vue";
import MenuNamecardDialog from "#src/components/Menu/NamecardDialog/Index.vue";
import MenuWorldLevelDialog from "#src/components/Menu/WorldLevelDialog/Index.vue";

interface Props {
  // Which dialog or prompt is open over the menu, its flags held by the menu, whose inert state waits on them
  isBirthdayDialogOpen: boolean;
  isExitPrompted: boolean;
  isNamecardDialogOpen: boolean;
  isWorldLevelDialogOpen: boolean;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level can be lowered or restored at all, and whether it is lowered, for its dialog's button
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // The namecard the player equipped by its item id, and the held namecards the picker offers
  namecardItemId: number;
  namecards: ProfileNamecard[];
  // The server's clock minus this machine's, which the World Level's cooldown is read against
  serverClockOffsetMs?: number;
  // The World Level, and when it last changed, for the cooldown its dialog's button waits on
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

const {
  gameText,
  isBirthdayDialogOpen,
  isExitPrompted,
  isNamecardDialogOpen,
  isWorldLevelAdjustable,
  isWorldLevelDialogOpen,
  isWorldLevelLowered,
  namecardItemId,
  namecards,
  serverClockOffsetMs,
  worldLevel,
  worldLevelChangedAt,
} = defineProps<Props>();
const emit = defineEmits<{
  closeBirthday: [];
  closeExit: [];
  closeNamecard: [];
  closeWorldLevel: [];
  pickNamecard: [itemId: number];
  quit: [];
  setBirthday: [birthday: TravelerBirthdaySave];
  toggleWorldLevel: [];
}>();
</script>

<template>
  <MenuBirthdayDialog
    v-if="isBirthdayDialogOpen"
    :game-text
    @close="emit('closeBirthday')"
    @confirm="(birthday) => emit('setBirthday', birthday)"
  />
  <MenuNamecardDialog
    v-if="isNamecardDialogOpen"
    :game-text
    :namecard-item-id
    :namecards
    @close="emit('closeNamecard')"
    @pick="(itemId) => emit('pickNamecard', itemId)"
  />
  <MenuWorldLevelDialog
    v-if="isWorldLevelDialogOpen"
    :game-text
    :is-world-level-adjustable
    :is-world-level-lowered
    :server-clock-offset-ms
    :world-level
    :world-level-changed-at
    @close="emit('closeWorldLevel')"
    @toggle-world-level="emit('toggleWorldLevel')"
  />
  <MenuExit v-if="isExitPrompted" :game-text @close="emit('closeExit')" @quit="emit('quit')" />
</template>
