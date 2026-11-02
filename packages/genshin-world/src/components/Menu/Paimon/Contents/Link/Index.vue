<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { GameText, GameTextKey } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuEntryGlyphMap } from "#src/services/menu/MenuEntryGlyphMap";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The icons that carry a red dot; this link shows its dot when its icon is one of them
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // The words the link's label is read from, in the reader's language
  gameText: GameText;
  // The link's icon, drawn in its glyph
  icon: MenuEntryIcon;
  // The game text id of the link's label
  labelKey: GameTextKey;
}

const { alertedIcons, gameText, icon, labelKey } = defineProps<Props>();
</script>

<template>
  <GameButton class="entry link" :kind="GameButtonKind.Row" tip="" disabled>
    <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
    <span class="label">{{ gameText[labelKey] }}</span>
    <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
  </GameButton>
</template>

<style scoped src="../../../../../styles/paimonAlert.css"></style>
<style scoped src="../../../../../styles/paimonEntry.css"></style>
