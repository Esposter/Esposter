<script setup lang="ts">
import type { ProfileNamecard } from "#src/models/profile/ProfileNamecard";
import type { GameText } from "genshin-text";

import MenuDialog from "#src/components/Menu/Dialog/Index.vue";
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { GameButton, GameButtonKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  gameText: GameText;
  // The held namecards the profile can show, the one equipped marked, each one picked by its item id
  namecardItemId: number;
  namecards: ProfileNamecard[];
}

// Back closes the picker
const { gameText, namecardItemId, namecards } = defineProps<Props>();
const emit = defineEmits<{ close: []; pick: [itemId: number] }>();
</script>

<template>
  <MenuDialog :title="gameText[GameTextKey.ChangeNamecard]">
    <GameButton
      v-for="{ itemId, name } of namecards"
      :key="itemId"
      class="choice"
      tip=""
      :aria-pressed="itemId === namecardItemId"
      :kind="GameButtonKind.Row"
      @click="emit('pick', itemId)"
    >
      {{ name }}
    </GameButton>
    <GameButton
      class="close"
      tip=""
      :aria-label="gameText[GameTextKey.Back]"
      :kind="GameButtonKind.Plain"
      @click="emit('close')"
    >
      <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Close]" />
    </GameButton>
  </MenuDialog>
</template>

<style scoped>
.close {
  align-self: flex-end;
}
</style>
