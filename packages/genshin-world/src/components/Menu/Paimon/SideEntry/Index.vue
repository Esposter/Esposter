<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { getMenuFrameMark } from "#src/services/menu/getMenuFrameMark";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The icons that carry a red dot, which this button shows when its own icon is one of them
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // Whether the screen this button opens is built, which decides whether the button is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The side bar's icon, which the button's box and glyph are drawn from
  icon: MenuFrameIcon;
  // The screen the button opens
  screenKind: TitledScreenKind;
  // The button's tooltip, its screen's name in the reader's language
  tip: string;
}

const { icon } = defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
// The icon's box and glyph, one object the button keeps rather than a fresh one per render
const mark = computed(() => getMenuFrameMark(icon));
</script>

<template>
  <GameButton
    class="side-entry"
    :disabled="!checkIsBuilt(screenKind)"
    :kind="GameButtonKind.Disc"
    :style="mark.style"
    :tip
    @click="emit('open')"
  >
    <MenuGlyph :glyph="mark.glyph" />
    <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
  </GameButton>
</template>

<style scoped src="../../../../styles/paimonAlert.css"></style>
