<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuScrollTrack from "#src/components/Menu/ScrollTrack/Index.vue";
import MenuSettingsRow from "#src/components/Menu/Settings/Row/Index.vue";
import MenuSettingsTabs from "#src/components/Menu/Settings/Tabs/Index.vue";
import { useSettingsGameText } from "#src/composables/useSettingsGameText";
import { useSettingsRowList } from "#src/composables/useSettingsRowList";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { SettingsTab } from "#src/models/menu/SettingsTab";
import { getMenuFrameMark } from "#src/services/menu/getMenuFrameMark";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { SettingsTabGameTextKeyMap } from "#src/services/menu/SettingsTabGameTextKeyMap";
import { SettingsTabSectionsMap } from "#src/services/menu/SettingsTabSectionsMap";
import { useResizeObserver } from "@vueuse/core";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The quality tier the device was given, which the row's words mark as the default
  defaultQualityTier: QualityTier;
  // The game's words in the reader's language
  gameText: GameText;
  // The reader's own game language, whose words the game text given is
  language: GameLanguage;
}

// The settings the screen shows and changes, which the host keeps on this device
const settings = defineModel<GenshinSettings>("settings", { required: true });
const tab = defineModel<SettingsTab>("tab", { default: SettingsTab.Graphics });
const { defaultQualityTier, gameText, language } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The close mark's box and glyph, one object each the button and its mark keep rather than a fresh one per render
const closeMark = getMenuFrameMark(MenuFrameIcon.Close);
const page = useTemplateRef("page");
const content = useTemplateRef("content");
const openedList = shallowRef<SettingsRowKind>();
const shownGameText = useSettingsGameText(
  settings,
  () => language,
  () => gameText,
);
const { openedOptions, qualityValue } = useSettingsRowList(
  settings,
  tab,
  openedList,
  shownGameText,
  () => defaultQualityTier,
);
// The scroll thumb's share of the track and how far down it stands, from the page's scroll as it stands
const scrollThumb = shallowRef({ offset: 0, share: 1 });
const updateScrollThumb = () => {
  if (!page.value) return;
  const { clientHeight, scrollHeight, scrollTop } = page.value;
  const scrollRange = scrollHeight - clientHeight;
  scrollThumb.value = {
    offset: scrollRange > 0 ? scrollTop / scrollRange : 0,
    share: Math.min(clientHeight / scrollHeight, 1),
  };
};

useResizeObserver(content, updateScrollThumb);

// The screen is a dialog over the world, so focus starts inside it, on the open tab's page, which the keyboard scrolls
onMounted(() => {
  page.value?.focus();
});
</script>

<template>
  <!-- The game's settings over the blurred world: the breadcrumb of the screen's name and its tab in the header, the tabs
       Down the left and the open tab's rows on the right under their headings, scrolling under the header with a thumb
       Beside them. A row is its label with its value: the graphics quality and the game language open a list of the
       World's own, a volume the world backs sets its level, and every other row is drawn disabled at the value the clip
       Shows -->
  <GameScreen class="settings" role="dialog" aria-modal="true" :aria-label="shownGameText[GameTextKey.Settings]">
    <div class="header" />
    <svg class="small-gear" aria-hidden="true" viewBox="0 0 27 27">
      <path
        d="M 11.08 3.8 L 11.92 0.6 L 15.08 0.6 L 15.92 3.8 L 18.65 4.93 L 21.5 3.26 L 23.74 5.5 L 22.07 8.35 L 23.2 11.08 L 26.4 11.92 L 26.4 15.08 L 23.2 15.92 L 22.07 18.65 L 23.74 21.5 L 21.5 23.74 L 18.65 22.07 L 15.92 23.2 L 15.08 26.4 L 11.92 26.4 L 11.08 23.2 L 8.35 22.07 L 5.5 23.74 L 3.26 21.5 L 4.93 18.65 L 3.8 15.92 L 0.6 15.08 L 0.6 11.92 L 3.8 11.08 L 4.93 8.35 L 3.26 5.5 L 5.5 3.26 L 8.35 4.93 Z M 18 13.5 A 4.5 4.5 0 1 0 9 13.5 A 4.5 4.5 0 1 0 18 13.5 Z"
      />
    </svg>
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.SettingsGear]" class="gear" />
    <p class="breadcrumb">
      {{ shownGameText[GameTextKey.Settings] }} / {{ shownGameText[SettingsTabGameTextKeyMap[tab]] }}
    </p>
    <GameButton
      class="close"
      :aria-label="shownGameText[GameTextKey.Back]"
      :kind="GameButtonKind.Disc"
      :style="closeMark.style"
      tip=""
      @click="emit('close')"
    >
      <MenuGlyph :glyph="closeMark.glyph" class="close-glyph" />
    </GameButton>
    <MenuSettingsTabs v-model:tab="tab" :game-text="shownGameText" />
    <div :key="tab" ref="page" class="page" role="tabpanel" tabindex="0" @scroll="updateScrollThumb()">
      <div ref="content" class="content">
        <template v-for="{ headingKey, rows } of SettingsTabSectionsMap[tab] ?? []" :key="headingKey">
          <p class="heading" role="heading" aria-level="2">{{ shownGameText[headingKey] }}</p>
          <MenuSettingsRow
            v-for="row of rows"
            :key="row.labelKey"
            v-model:opened-list="openedList"
            v-model:settings="settings"
            :game-text="shownGameText"
            :options="openedOptions"
            :quality-value
            :row
            :tab
          />
        </template>
      </div>
    </div>
    <!-- The scroll bar shows only while the page has more than it shows -->
    <template v-if="scrollThumb.share < 1">
      <svg class="scroll-caret" aria-hidden="true" viewBox="0 0 10 5"><polyline points="1 4.25 5 0.75 9 4.25" /></svg>
      <MenuScrollTrack class="track" :offset="scrollThumb.offset" :share="scrollThumb.share" />
    </template>
  </GameScreen>
</template>

<style scoped>
/* Measured on the English PC client's settings in the world at 1920 wide (`yt-5EmJX_RyuY8-menu-settings`), where a unit
   Is a pixel; the gear, the breadcrumb and the close mark keep the wiki's still at 1680 wide, where a unit is 0.875 of its
   Pixels. Everything the page draws is translucent over the blurred world, which it has no copy of: the header's veil,
   The rows' glass and the tabs' words take their colour and alpha from the two stills' different worlds behind them */
.settings {
  --reference-pixel: calc(var(--unit) / 0.875);
  color: #ece5d7;
}

/* Provisional: a dark veil, 0.4 opaque at the top and gone by 106, solved from the clip's header over its world and the
   Wiki still's over its own, which agree on it to a level */
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--unit) * 106);
  background: linear-gradient(rgb(15 14 20 / 0.4), rgb(15 14 20 / 0.27) calc(var(--unit) * 84), rgb(15 14 20 / 0));
}

.gear {
  color: #d3bb8c;
}

/* The grey gear behind the settings' own, drawn rather than traced, as the trace caught only its edge */
.small-gear {
  position: absolute;
  top: calc(var(--unit) * 23);
  left: calc(var(--unit) * 87.5);
  width: calc(var(--unit) * 27);
  height: calc(var(--unit) * 27);
  fill: #7f7667;
  fill-rule: evenodd;
}

.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 35);
  left: calc(var(--unit) * 143);
  margin: 0;
  color: #d4c6a8;
  font-size: calc(var(--unit) * 25.5);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.6);
  line-height: 1;
}

/* The close mark's disc in its translucent ring, the close button's box at the mark's own place. Its rest colour is the
   Mark's cream; the disc lights behind it under the pointer or the keyboard's focus, as a Disc does */
.close {
  position: absolute;
  padding: 0;
  border: calc(var(--unit) * 5.5) solid rgb(240 236 236 / 0.47);
  border-radius: 50%;
  background: none;
  box-sizing: border-box;
  color: #ece5d7;
}

/* The mark is placed at the button's padding box, inside its ring, so it is moved out by the ring's width to sit concentric
   With the ring, as the reference's disc does. Measured on the clip's close button (`yt-5EmJX_RyuY8-menu-settings`, 1920
   Wide), where the cream disc sat a ring's width right and down of the ring's centre */
.close-glyph {
  color: inherit;
  translate: calc(var(--unit) * -5.5) calc(var(--unit) * -5.5);
}

.page {
  position: absolute;
  top: calc(var(--unit) * 100);
  left: calc(var(--unit) * 480);
  width: calc(var(--unit) * 1319);
  height: calc(var(--unit) * 946);
  outline: none;
  overflow-y: auto;
  scrollbar-width: none;
}

.content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 11.125);
  padding: calc(var(--unit) * 24.7) 0 calc(var(--unit) * 25);
}

.heading {
  height: calc(var(--unit) * 47.5);
  margin: 0;
  color: #ffffff;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.2);
  line-height: calc(var(--unit) * 51);
}

.scroll-caret {
  position: absolute;
  top: calc(var(--unit) * 124);
  left: calc(var(--unit) * 1816.5);
  width: calc(var(--unit) * 10);
  height: calc(var(--unit) * 5);
  fill: none;
  stroke: rgb(236 229 215 / 0.4);
  stroke-width: 1.5;
}

/* Provisional: the track's and the thumb's alphas, solved from the two worlds the clip shows behind them */
.track {
  top: calc(var(--unit) * 130);
  left: calc(var(--unit) * 1819);
  width: calc(var(--unit) * 5);
  height: calc(var(--unit) * 890);
  background: rgb(89 89 89 / 0.19);
}

.track :deep(.thumb) {
  left: calc(var(--unit) * -1);
  width: calc(var(--unit) * 7);
  border-radius: calc(var(--unit) * 3.5) calc(var(--unit) * 3.5) 0 0;
  background: rgb(217 216 212 / 0.8);
}
</style>
