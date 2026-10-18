<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { VolumeSetting } from "#src/models/menu/VolumeSetting";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuScrollTrack from "#src/components/Menu/ScrollTrack/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { SettingsTab } from "#src/models/menu/SettingsTab";
import {
  GRAPHICS_QUALITY_TIERS,
  SETTINGS_TABS,
  VOLUME_LEVEL_MAXIMUM,
  VOLUME_LEVEL_MINIMUM,
} from "#src/services/menu/constants";
import { getMenuGlyphStyle } from "#src/services/menu/getMenuGlyphStyle";
import { getVolumeLevelAt } from "#src/services/menu/getVolumeLevelAt";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { QualityTierGameTextKeyMap } from "#src/services/menu/QualityTierGameTextKeyMap";
import { SettingsTabGameTextKeyMap } from "#src/services/menu/SettingsTabGameTextKeyMap";
import { SettingsTabSectionsMap } from "#src/services/menu/SettingsTabSectionsMap";
import { getResultAsync } from "@esposter/shared";
import { useResizeObserver } from "@vueuse/core";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import {
  fillGameTextValues,
  GameLanguages,
  GameTextKey,
  GameTextLoaderMap,
  getLanguageDisplayName,
} from "genshin-text";

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
const page = useTemplateRef("page");
const content = useTemplateRef("content");
const sections = computed(() => SettingsTabSectionsMap[tab.value] ?? []);
// The labels show the words of the language chosen here. The reader's own language's are the game text given, and any
// Other is its chunk, loaded when it is chosen and kept only if it is still the choice when it arrives
const chosenGameText = shallowRef<GameText>();
const shownGameText = computed(() => chosenGameText.value ?? gameText);
watch(
  () => settings.value.language,
  (newLanguage) => {
    if (newLanguage === language) {
      chosenGameText.value = undefined;
      return;
    }

    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
    getResultAsync(() => GameTextLoaderMap[newLanguage]()).match(
      (loadedGameText) => {
        if (settings.value.language === newLanguage) chosenGameText.value = loadedGameText;
      },
      (error) => console.error(error),
    );
  },
  { immediate: true },
);
// The Graphics Quality and Game Language rows each open a list, one at a time, and a change of tab closes it
const openedList = shallowRef<SettingsRowKind>();
watch(tab, () => {
  openedList.value = undefined;
});
const getQualityTierWords = (qualityTier: QualityTier): string => {
  const words = shownGameText.value[QualityTierGameTextKeyMap[qualityTier]];
  return qualityTier === defaultQualityTier
    ? fillGameTextValues(shownGameText.value[GameTextKey.SettingsDefault], words)
    : words;
};
const qualityValue = computed(() => getQualityTierWords(settings.value.qualityTier));
const languageValue = computed(() => getLanguageDisplayName(settings.value.language, settings.value.language));
// The options the open list offers, each with whether it is the setting now and the choice that sets it
const openedOptions = computed(() => {
  if (openedList.value === SettingsRowKind.Language)
    return GameLanguages.map((gameLanguage) => ({
      choose: () => {
        settings.value = { ...settings.value, language: gameLanguage };
        openedList.value = undefined;
      },
      isSelected: gameLanguage === settings.value.language,
      label: getLanguageDisplayName(gameLanguage, gameLanguage),
    }));
  if (openedList.value === SettingsRowKind.Quality)
    return GRAPHICS_QUALITY_TIERS.map((qualityTier) => ({
      choose: () => {
        settings.value = { ...settings.value, qualityTier };
        openedList.value = undefined;
      },
      isSelected: qualityTier === settings.value.qualityTier,
      label: getQualityTierWords(qualityTier),
    }));
  return [];
});
const isListRow = (row: SettingsRow): boolean =>
  row.kind === SettingsRowKind.Quality || row.kind === SettingsRowKind.Language;
const toggleList = (kind: SettingsRowKind): void => {
  openedList.value = openedList.value === kind ? undefined : kind;
};
// A volume row's level: the setting the world backs it with, or the level an unbacked slider is drawn at
type VolumeRow = Extract<SettingsRow, { kind: SettingsRowKind.Slider | SettingsRowKind.Volume }>;
const getVolumeLevel = (row: VolumeRow): number =>
  row.kind === SettingsRowKind.Volume ? settings.value[row.setting] : row.volume;
const setVolume = (setting: VolumeSetting, level: number): void => {
  settings.value = { ...settings.value, [setting]: level };
};
// A volume follows the pointer while its button is held, the pointer captured at the press so a drag past the track's
// Ends keeps setting it, where the level stops at its limit
const dragVolume = (event: PointerEvent, setting: VolumeSetting): void => {
  if (!(event.currentTarget instanceof HTMLElement) || event.buttons === 0) return;

  const { left, width } = event.currentTarget.getBoundingClientRect();
  setVolume(setting, getVolumeLevelAt((event.clientX - left) / width));
};
const startVolumeDrag = (event: PointerEvent, setting: VolumeSetting): void => {
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture(event.pointerId);
  dragVolume(event, setting);
};
// The arrow keys step a volume by one level, held within its range as a drag is
const stepVolume = (event: KeyboardEvent, setting: VolumeSetting): void => {
  const level = settings.value[setting];
  if (event.key === "ArrowLeft" || event.key === "ArrowDown")
    setVolume(setting, Math.max(level - 1, VOLUME_LEVEL_MINIMUM));
  else if (event.key === "ArrowRight" || event.key === "ArrowUp")
    setVolume(setting, Math.min(level + 1, VOLUME_LEVEL_MAXIMUM));
  else return;

  event.preventDefault();
};
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
      :style="getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Close])"
      @click="emit('close')"
    >
      <MenuGlyph :glyph="{ ...MenuFrameGlyphMap[MenuFrameIcon.Close], x: 0, y: 0 }" class="close-glyph" />
    </GameButton>
    <div class="tabs" role="tablist" aria-orientation="vertical">
      <GameButton
        v-for="settingsTab of SETTINGS_TABS"
        :key="settingsTab"
        class="tab"
        role="tab"
        :aria-selected="settingsTab === tab"
        :disabled="!SettingsTabSectionsMap[settingsTab]"
        :kind="GameButtonKind.Row"
        @click="tab = settingsTab"
      >
        <svg v-if="settingsTab === tab" class="selected-bullet" aria-hidden="true" viewBox="0 0 28 28">
          <path d="M 14 1.5 L 26.5 14 L 14 26.5 L 1.5 14 Z" />
          <path class="arrow" d="M 12 9 L 17.5 14 L 12 19 Z" />
        </svg>
        <span v-else class="bullet" />
        <span class="name">{{ shownGameText[SettingsTabGameTextKeyMap[settingsTab]] }}</span>
      </GameButton>
    </div>
    <div :key="tab" ref="page" class="page" role="tabpanel" tabindex="0" @scroll="updateScrollThumb()">
      <div ref="content" class="content">
        <template v-for="{ headingKey, rows } of sections" :key="headingKey">
          <p class="heading" role="heading" aria-level="2">{{ shownGameText[headingKey] }}</p>
          <template v-for="row of rows" :key="row.labelKey">
            <div class="row">
              <span class="label">{{ shownGameText[row.labelKey] }}</span>
              <template v-if="row.kind === SettingsRowKind.Slider || row.kind === SettingsRowKind.Volume">
                <svg class="speaker" aria-hidden="true" viewBox="0 0 36 30">
                  <path d="M 3 10 L 9 10 L 18 3 L 18 27 L 9 20 L 3 20 Z" />
                  <path class="wave" d="M 23 9 Q 26 15 23 21 M 28 5 Q 33 15 28 25" />
                </svg>
                <span class="volume">{{ getVolumeLevel(row) }}</span>
                <div
                  v-if="row.kind === SettingsRowKind.Volume"
                  class="slider"
                  role="slider"
                  tabindex="0"
                  :aria-label="shownGameText[row.labelKey]"
                  :aria-valuemax="VOLUME_LEVEL_MAXIMUM"
                  :aria-valuemin="VOLUME_LEVEL_MINIMUM"
                  :aria-valuenow="getVolumeLevel(row)"
                  @keydown="stepVolume($event, row.setting)"
                  @pointerdown="startVolumeDrag($event, row.setting)"
                  @pointermove="dragVolume($event, row.setting)"
                >
                  <span class="knob" :style="{ left: `${(getVolumeLevel(row) / VOLUME_LEVEL_MAXIMUM) * 100}%` }" />
                </div>
                <div
                  v-else
                  class="slider"
                  role="slider"
                  aria-disabled="true"
                  :aria-label="shownGameText[row.labelKey]"
                  :aria-valuemax="VOLUME_LEVEL_MAXIMUM"
                  :aria-valuemin="VOLUME_LEVEL_MINIMUM"
                  :aria-valuenow="getVolumeLevel(row)"
                >
                  <span class="knob" :style="{ left: `${(getVolumeLevel(row) / VOLUME_LEVEL_MAXIMUM) * 100}%` }" />
                </div>
              </template>
              <button
                v-else
                class="choice"
                :aria-label="shownGameText[row.labelKey]"
                :aria-expanded="isListRow(row) ? openedList === row.kind : undefined"
                :disabled="!isListRow(row)"
                type="button"
                @click="toggleList(row.kind)"
              >
                <svg class="star" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M 24 0 Q 31 17 48 24 Q 31 31 24 48 Q 17 31 0 24 Q 17 17 24 0 Z" />
                </svg>
                <svg class="star faint" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M 24 0 Q 31 17 48 24 Q 31 31 24 48 Q 17 31 0 24 Q 17 17 24 0 Z" />
                </svg>
                <span class="value">
                  <template v-if="row.kind === SettingsRowKind.Quality">{{ qualityValue }}</template>
                  <template v-else-if="row.kind === SettingsRowKind.Language">{{ languageValue }}</template>
                  <template v-else-if="row.kind === SettingsRowKind.Action">{{ shownGameText[row.valueKey] }}</template>
                  <template v-else>{{ row.getValue(shownGameText, settings.language) }}</template>
                </span>
                <svg v-if="row.kind === SettingsRowKind.Action" class="go" aria-hidden="true" viewBox="0 0 25 25">
                  <circle cx="12.5" cy="12.5" r="12.5" />
                  <path class="arrow" d="M 8.5 7 L 17 12.5 L 8.5 18 L 10.5 12.5 Z" />
                </svg>
                <span v-else class="caret" />
              </button>
            </div>
            <div
              v-if="openedList === row.kind"
              class="options"
              role="listbox"
              :aria-label="shownGameText[row.labelKey]"
            >
              <button
                v-for="option of openedOptions"
                :key="option.label"
                class="option"
                role="option"
                type="button"
                :aria-selected="option.isSelected"
                @click="option.choose()"
              >
                {{ option.label }}
              </button>
            </div>
          </template>
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

.close-glyph {
  color: inherit;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 121);
  left: 0;
  display: flex;
  flex-direction: column;
}

.tab {
  position: relative;
  height: calc(var(--unit) * 69.75);
  padding: 0 0 0 calc(var(--unit) * 144);
  border: none;
  background: none;
  color: rgb(232 232 230 / 0.74);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.2);
  line-height: 1;
  text-align: start;
  text-shadow: 0 0 calc(var(--unit) * 4) rgb(30 30 40 / 0.3);
  white-space: nowrap;
}

.tab[aria-selected="true"] {
  padding-bottom: calc(var(--unit) * 3);
  padding-left: calc(var(--unit) * 154);
  color: #edeae7;
  font-size: calc(var(--unit) * 41);
  letter-spacing: calc(var(--unit) * 2.4);
}

/* Provisional: the light the open tab's name trails to its right, behind its last letters, solved from the clip's glow
   Over its world, without the sparkles that drift along it */
.name {
  position: relative;
}

.tab[aria-selected="true"] .name::after {
  position: absolute;
  top: calc(50% - var(--unit) * 12.5);
  left: calc(100% - var(--unit) * 36);
  z-index: -1;
  width: calc(var(--unit) * 170);
  height: calc(var(--unit) * 24);
  background: linear-gradient(to right, rgb(255 255 255 / 0.45), rgb(255 255 255 / 0.2) 50%, rgb(255 255 255 / 0));
  content: "";
  mask-image: linear-gradient(transparent, #000, transparent);
}

/* Dimmer than the name beside it */
.bullet {
  position: absolute;
  top: calc(50% - var(--unit));
  left: calc(var(--unit) * 124.5);
  width: calc(var(--unit) * 10.5);
  height: calc(var(--unit) * 10.5);
  background: rgb(232 232 230 / 0.52);
  transform: translate(-50%, -50%) rotate(45deg);
}

.selected-bullet {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 110.5);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 28);
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
  transform: translateY(-50%);
}

.selected-bullet .arrow {
  fill: currentcolor;
  stroke: none;
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

/* The row's glass, lighter over its label and a tan panel under its value from 977 across, solved from the clip's rows
   Over the world between them. Provisional: the faint shadow round its edge, read off the clip's column through a row
   Against the world beside it */
.row {
  position: relative;
  flex: none;
  height: calc(var(--unit) * 56);
  border-radius: calc(var(--unit) * 28);
  background: rgb(239 231 221 / 0.78);
  box-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.15);
  color: #4b4d54;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
  overflow: hidden;
}

/* Provisional: the white rim a row takes under the pointer or the keyboard's focus, about 4 across and centred on its
   Edge, read off the clip's rows lit one at a time from 176 to 179 seconds */
.row:hover,
.row:focus-within {
  box-shadow:
    0 0 calc(var(--unit) * 1.5) calc(var(--unit) * 1) rgb(255 255 255 / 0.9),
    inset 0 0 calc(var(--unit) * 1.5) calc(var(--unit) * 1) rgb(255 255 255 / 0.6);
}

.label {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 29);
  line-height: 1;
  transform: translateY(-50%);
}

.choice {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(var(--unit) * 342);
  height: 100%;
  padding: 0;
  border: none;
  background: rgb(216 203 183 / 0.86);
  color: inherit;
  cursor: inherit;
  font: inherit;
  letter-spacing: inherit;
}

.row:has(.choice) {
  background: linear-gradient(
    to right,
    rgb(239 231 221 / 0.78) calc(var(--unit) * 977),
    rgb(239 231 221 / 0) calc(var(--unit) * 977)
  );
}

/* The star the value's panel begins at, and a fainter one before it. Provisional: the second's strength, read by eye */
.star {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * -24);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  fill: #cebb99;
}

.faint {
  left: calc(var(--unit) * -76);
  opacity: 0.3;
}

.value {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  line-height: 1;
  text-align: center;
  transform: translateY(-50%);
}

.caret {
  position: absolute;
  top: calc(var(--unit) * 23);
  right: calc(var(--unit) * 17.5);
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 10.5) solid #4b5464;
  border-right: calc(var(--unit) * 8.5) solid transparent;
  border-left: calc(var(--unit) * 8.5) solid transparent;
}

/* An action's mark in place of the caret, a slate disc with a pale gold arrow */
.go {
  position: absolute;
  top: calc(var(--unit) * 15.5);
  right: calc(var(--unit) * 13);
  width: calc(var(--unit) * 25);
  height: calc(var(--unit) * 25);
  fill: #4d5464;
}

.go .arrow {
  fill: #cebf8e;
}

/* A volume's speaker, its number in a faint box and its slider, the knob a diamond at its share of the line. Provisional:
   Their sizes and places, read by eye off the clip's Audio tab at 178 seconds */
.speaker {
  position: absolute;
  top: calc(var(--unit) * 13);
  left: calc(var(--unit) * 802);
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 30);
  fill: #4b5568;
}

.speaker .wave {
  fill: none;
  stroke: rgb(75 85 104 / 0.45);
  stroke-width: 3;
}

.volume {
  position: absolute;
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 852);
  width: calc(var(--unit) * 66);
  height: calc(var(--unit) * 40);
  border-radius: calc(var(--unit) * 6);
  background: rgb(75 77 84 / 0.03);
  line-height: calc(var(--unit) * 40);
  text-align: center;
}

.slider {
  position: absolute;
  top: calc(var(--unit) * 24.5);
  left: calc(var(--unit) * 952);
  width: calc(var(--unit) * 330);
  height: calc(var(--unit) * 7);
  border-radius: calc(var(--unit) * 3.5);
  background: #faf5eb;
}

.knob {
  position: absolute;
  top: 50%;
  width: calc(var(--unit) * 19);
  height: calc(var(--unit) * 19);
  border: calc(var(--unit) * 2) solid #8f8a85;
  background: #ffffff;
  box-sizing: border-box;
  transform: translate(-50%, -50%) rotate(45deg);
}

.scroll-caret {
  position: absolute;
  top: calc(var(--unit) * 120);
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
/* The list an open row shows under it, each option a row's glass and the chosen one a tan panel. Provisional: the list's
   Place and the chosen option's colour, which the clip shows only with the list closed */
.options {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 8);
}

.option {
  height: calc(var(--unit) * 56);
  padding: 0 calc(var(--unit) * 29);
  border: none;
  border-radius: calc(var(--unit) * 28);
  background: rgb(239 231 221 / 0.78);
  color: #4b4d54;
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
  text-align: start;
}

.option[aria-selected="true"] {
  background: rgb(216 203 183 / 0.86);
}

/* A volume's line takes the pointer, which sets its level, and the arrow keys once it has the focus */
.slider {
  touch-action: none;
}

.slider:focus-visible {
  outline: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.9);
  outline-offset: calc(var(--unit) * 4);
}
</style>
