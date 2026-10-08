<script setup lang="ts">
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The words of the graphics quality the row shows, in the reader's language
  qualityLabel: string;
}

const { gameText, qualityLabel } = defineProps<Props>();
const emit = defineEmits<{ close: []; quality: [] }>();
const closeButton = useTemplateRef("closeButton");
// The screen is a dialog over the world, so focus starts inside it, on its way back
onMounted(() => {
  closeButton.value?.focus();
});
</script>

<template>
  <!-- The game's settings, on its Graphics tab: the breadcrumb of the screen's name and its tab in the header, the tabs
       Down the left and the tab's rows on the right, each row a label with its value and the choice it opens. Only the
       Rows the world backs are here; the Audio tab waits on its own reference -->
  <GameScreen class="settings" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Settings]">
    <div class="header" />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.SettingsGear]" class="gear" />
    <p class="breadcrumb">{{ gameText[GameTextKey.Settings] }} / {{ gameText[GameTextKey.Graphics] }}</p>
    <button
      ref="closeButton"
      class="close"
      :aria-label="gameText[GameTextKey.Back]"
      type="button"
      @click="emit('close')"
    />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Close]" class="close-glyph" />
    <p class="tab graphics">{{ gameText[GameTextKey.Graphics] }}</p>
    <p class="tab audio" aria-disabled="true">{{ gameText[GameTextKey.Audio] }}</p>
    <p class="heading">{{ gameText[GameTextKey.Graphics] }}</p>
    <button class="row" type="button" @click="emit('quality')">
      <span class="label">{{ gameText[GameTextKey.GraphicsQuality] }}</span>
      <span class="value">{{ qualityLabel }}</span>
      <span class="caret" />
    </button>
  </GameScreen>
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the header's colour, the tabs' diamonds, the rows' glass and the caret
   wait on the English PC client's settings measured at 1680 wide, where a unit is 0.875 of its pixels */
.settings {
  --reference-pixel: calc(var(--unit) / 0.875);
  color: #ece5d7;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--unit) * 94);
  background: #1e2238;
}

.gear {
  color: #d9b77a;
}

.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 31);
  left: calc(var(--unit) * 143);
  margin: 0;
  color: #d9c79d;
  font-size: calc(var(--unit) * 29);
  font-weight: 600;
  line-height: 1;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  left: calc(var(--unit) * 1817);
  width: calc(var(--unit) * 53);
  height: calc(var(--unit) * 53);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: inherit;
}

.close-glyph {
  color: #ece5d7;
}

.tab {
  position: absolute;
  margin: 0;
  font-weight: 600;
  line-height: 1;
}

.graphics {
  top: calc(var(--unit) * 126);
  left: calc(var(--unit) * 154);
  color: #ffffff;
  font-size: calc(var(--unit) * 52);
}

.audio {
  top: calc(var(--unit) * 210);
  left: calc(var(--unit) * 143);
  color: #c8c4bf;
  font-size: calc(var(--unit) * 34);
}

.heading {
  position: absolute;
  top: calc(var(--unit) * 137);
  left: calc(var(--unit) * 480);
  margin: 0;
  color: #ffffff;
  font-size: calc(var(--unit) * 34);
  font-weight: 700;
  line-height: 1;
}

.row {
  position: absolute;
  top: calc(var(--unit) * 183);
  left: calc(var(--unit) * 480);
  display: flex;
  align-items: center;
  width: calc(var(--unit) * 1319);
  height: calc(var(--unit) * 56);
  padding: 0 calc(var(--unit) * 29);
  border: none;
  border-radius: calc(var(--unit) * 28);
  background: rgb(214 207 196 / 0.9);
  box-sizing: border-box;
  color: #4b5568;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
}

.label {
  flex: 1;
  text-align: start;
}

.value {
  margin-right: calc(var(--unit) * 74);
}

.caret {
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 7) solid #4b5568;
  border-right: calc(var(--unit) * 7) solid transparent;
  border-left: calc(var(--unit) * 7) solid transparent;
}
</style>
