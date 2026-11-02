<script setup lang="ts">
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { getMenuFrameMark } from "#src/services/menu/getMenuFrameMark";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The name the info button is labelled by for assistive technology, the World Level's name in the reader's language
  label: string;
}

const { label } = defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
// The info mark's box, which the button takes; its glyph is drawn beside the button at its own place, not inside it
const infoMark = getMenuFrameMark(MenuFrameIcon.Info);
const worldLevelInfoButton = useTemplateRef("worldLevelInfoButton");
// The World Level dialog closes back to the info button, which lives here, so the menu focuses it through this
defineExpose({ focusWorldLevelInfo: () => worldLevelInfoButton.value?.focus() });
</script>

<template>
  <GameButton
    ref="worldLevelInfoButton"
    class="info"
    :aria-label="label"
    :kind="GameButtonKind.Plain"
    :style="infoMark.style"
    tip=""
    @click="emit('open')"
  />
  <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Info]" class="info-glyph" />
</template>

<style scoped>
/* The game draws the info icon the same hovered and pressed: its disc reads #eae4d6 throughout, from the pointer's
   Arrival to the click that opens the dialog (`yt-P13s7kSmVOE-world-level-dialog-2024.mkv`, 0.9 to 3.0 seconds at 60 frames) */
.info {
  position: absolute;
  border-radius: 50%;
}

.info-glyph {
  color: #ece5d7;
}
</style>
