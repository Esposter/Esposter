<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuEntryGlyphMap } from "#src/services/menu/MenuEntryGlyphMap";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The icons that carry a red dot; this tile shows its dot when its icon is one of them
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // Whether the screen this tile opens is built, which decides whether the tile is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The words the tile's label is read from, in the reader's language
  gameText: GameText;
  // The tile's icon, drawn in its glyph
  icon: MenuEntryIcon;
  // The screen the tile opens
  screenKind: TitledScreenKind;
}

defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <GameButton
    class="entry"
    :disabled="!checkIsBuilt(screenKind)"
    :kind="GameButtonKind.Row"
    tip=""
    @click="emit('open')"
  >
    <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
    <span class="label">{{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}</span>
    <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
  </GameButton>
</template>

<style scoped src="../../../../../styles/paimonAlert.css"></style>

<style scoped src="../../../../../styles/paimonEntry.css"></style>
