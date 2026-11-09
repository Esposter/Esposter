<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";

import MenuPaimonContentsEntry from "#src/components/Menu/Paimon/Contents/Entry/Index.vue";
import MenuPaimonContentsLink from "#src/components/Menu/Paimon/Contents/Link/Index.vue";
import { checkIsSystemOpen } from "#src/services/adventureRank/checkIsSystemOpen";
import { PAIMON_MENU_CONTENTS, PAIMON_MENU_LINKS } from "#src/services/menu/constants";

interface Props {
  // The rank the player has, which the systems the contents open at are gated on
  adventureRank: number;
  // The icons that carry a red dot, among the entries and the links; none is []
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // Whether an entry's screen is built, the test that draws an entry disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The main quests the player has finished, which the systems a quest opens are gated on
  finishedMainQuestIds: ReadonlySet<number>;
  // The game's words in the reader's language
  gameText: GameText;
}

const { adventureRank, finishedMainQuestIds } = defineProps<Props>();
const emit = defineEmits<{ open: [screenKind: TitledScreenKind] }>();
// The contents the player's rank and quests have opened, in the game's order: a system not open yet is not drawn at all
const openContents = computed(() =>
  PAIMON_MENU_CONTENTS.filter(({ screenKind }) => checkIsSystemOpen(screenKind, adventureRank, finishedMainQuestIds)),
);
</script>

<template>
  <div class="contents">
    <MenuPaimonContentsEntry
      v-for="{ icon, screenKind } of openContents"
      :key="screenKind"
      :alerted-icons
      :check-is-built
      :game-text
      :icon
      :screen-kind
      @open="emit('open', screenKind)"
    />
    <MenuPaimonContentsLink
      v-for="{ icon, labelKey } of PAIMON_MENU_LINKS"
      :key="labelKey"
      :alerted-icons
      :game-text
      :icon
      :label-key
    />
  </div>
</template>

<style scoped>
/* The grid of four columns, each tile 151 pixels wide and 135 high, at the frame's pitch of 164.33 by 149 */
.contents {
  position: absolute;
  top: calc(var(--unit) * 372);
  left: calc(var(--unit) * 131);
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 151));
  grid-auto-rows: calc(var(--unit) * 135);
  column-gap: calc(var(--unit) * 13.3);
  row-gap: calc(var(--unit) * 14);
}
</style>
