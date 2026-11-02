<script setup lang="ts">
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { getMenuFrameMark } from "#src/services/menu/getMenuFrameMark";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The tooltip of the Quit Game button, its name in the reader's language
  tip: string;
}

const { tip } = defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
// Quit is anchored from the bottom edge, as the frame anchors it: its box stands 36 of the 1440 high still's pixels above
// That still's bottom, each still pixel drawn at `--reference-pixel`, which puts its centre 55 units above the frame's bottom
const quitMark = getMenuFrameMark(MenuFrameIcon.Quit);
const quitStyle = { ...quitMark.style, bottom: "calc(var(--reference-pixel) * 36)", top: "auto" };
const quitGameButton = useTemplateRef("quitGameButton");
// The Quit Game button is inert until the menu is patched, so the menu focuses it through this on the tick after the prompt closes
defineExpose({ focusQuitGame: () => quitGameButton.value?.focus() });
</script>

<template>
  <GameButton
    ref="quitGameButton"
    class="side-entry"
    :kind="GameButtonKind.Disc"
    :style="quitStyle"
    :tip
    @click="emit('open')"
  >
    <MenuGlyph :glyph="quitMark.glyph" />
  </GameButton>
</template>
