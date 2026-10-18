<script setup lang="ts">
import type { ProfileNamecard } from "#src/models/profile/ProfileNamecard";
import type { GameText } from "genshin-text";

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
  <div class="namecard-dialog" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ChangeNamecard]">
    <p class="title" role="heading" aria-level="2">{{ gameText[GameTextKey.ChangeNamecard] }}</p>
    <GameButton
      v-for="{ itemId, name } of namecards"
      :key="itemId"
      class="choice"
      :aria-pressed="itemId === namecardItemId"
      :kind="GameButtonKind.Row"
      @click="emit('pick', itemId)"
    >
      {{ name }}
    </GameButton>
    <GameButton
      class="close"
      :aria-label="gameText[GameTextKey.Back]"
      :kind="GameButtonKind.Plain"
      @click="emit('close')"
    >
      <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Close]" />
    </GameButton>
  </div>
</template>

<style scoped>
/* Provisional: the picker's panel sits over the menu at its centre until the parity compare fits it to the reference */
.namecard-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 8);
  max-height: 70%;
  overflow-y: auto;
  padding: calc(var(--unit) * 16);
  background: rgb(14 22 32 / 92%);
  transform: translate(-50%, -50%);
}

/* Provisional: the title's size and colour are the game's heading colour until the parity compare fits it */
.title {
  margin: 0;
  color: #d0bf9f;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  text-align: center;
}

.close {
  align-self: flex-end;
}
</style>
