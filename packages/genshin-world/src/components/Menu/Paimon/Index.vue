<script setup lang="ts">
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";

import MenuExit from "#src/components/Menu/Exit/Index.vue";
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuWorldLevelTips from "#src/components/Menu/WorldLevelTips/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { PAIMON_MENU_CONTENTS, PAIMON_MENU_LINKS, PAIMON_MENU_SIDE_BAR } from "#src/services/menu/constants";
import { getMenuGlyphStyle } from "#src/services/menu/getMenuGlyphStyle";
import { MenuEntryGlyphMap } from "#src/services/menu/MenuEntryGlyphMap";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // Whether a screen is built, which its entry opens; an unbuilt one's entry is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level can be lowered or restored now, and whether it is lowered; the button is drawn only when it can
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // When the World Level last changed, for the cooldown its panel shows
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

const {
  adventureExpProgress,
  adventureRank,
  checkIsBuilt,
  gameText,
  isWorldLevelAdjustable,
  isWorldLevelLowered,
  worldLevel,
  worldLevelChangedAt,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; open: [screenKind: TitledScreenKind]; quit: []; toggleWorldLevel: [] }>();
const backButton = useTemplateRef("backButton");
// The World Level panel is open while its button is hovered or focused
const isWorldLevelTipsOpen = ref(false);
// Quit Game opens the prompt over the world in place of the menu, and only its own Continue or exit ends it
const isExitPrompted = ref(false);
// The menu is a dialog over the world, so focus starts inside it, on its way back
onMounted(() => {
  backButton.value?.focus();
});
</script>

<template>
  <!-- The game's pause menu, laid out in the reference's own pixels: its side bar down the left, of Back, the side bar's
       Screens and Quit Game, the profile card over the panel's entries in the game's four columns, and the world drawn
       Past the panel, where Paimon floats. Every entry the game has is here in its order: one whose screen is not built
       Yet is drawn disabled, and the links out to web pages are drawn disabled whole -->
  <GameScreen
    v-if="!isExitPrompted"
    class="paimon-menu"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.Paimon]"
  >
    <div class="side-bar" />
    <button
      ref="backButton"
      class="back"
      :aria-label="gameText[GameTextKey.Back]"
      type="button"
      @click="emit('close')"
    />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Back]" class="back-glyph" />
    <template v-for="{ icon, screenKind } of PAIMON_MENU_SIDE_BAR" :key="screenKind">
      <button
        class="side-entry"
        :aria-label="gameText[ScreenKindGameTextKeyMap[screenKind]]"
        :disabled="!checkIsBuilt(screenKind)"
        :style="getMenuGlyphStyle(MenuFrameGlyphMap[icon])"
        type="button"
        @click="emit('open', screenKind)"
      />
      <MenuGlyph :class="{ unbuilt: !checkIsBuilt(screenKind) }" :glyph="MenuFrameGlyphMap[icon]" />
    </template>
    <button
      class="side-entry"
      :aria-label="gameText[GameTextKey.QuitGame]"
      :style="getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Quit])"
      type="button"
      @click="isExitPrompted = true"
    />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Quit]" />
    <div class="panel" />
    <div class="card" />
    <div class="avatar" />
    <div class="edit" />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Edit]" class="edit-glyph" />
    <p class="uid-label">{{ gameText[GameTextKey.Uid] }}</p>
    <div class="uid-pill" />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Copy]" class="copy-glyph" />
    <button class="copy" disabled type="button">{{ gameText[GameTextKey.Copy] }}</button>
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.ExpBadge]" />
    <p class="rank-title">{{ gameText[GameTextKey.AdventureRank] }} {{ adventureRank }}</p>
    <p class="exp-label">{{ gameText[GameTextKey.AdventureExp] }}</p>
    <div class="exp-bar"><div class="exp-fill" :style="{ width: `${adventureExpProgress * 100}%` }" /></div>
    <p class="world-level">{{ gameText[GameTextKey.WorldLevel] }} {{ worldLevel }}</p>
    <button
      v-if="isWorldLevelAdjustable"
      class="world-level-adjust"
      type="button"
      @blur="isWorldLevelTipsOpen = false"
      @click="emit('toggleWorldLevel')"
      @focus="isWorldLevelTipsOpen = true"
      @pointerenter="isWorldLevelTipsOpen = true"
      @pointerleave="isWorldLevelTipsOpen = false"
    >
      {{ gameText[isWorldLevelLowered ? GameTextKey.WorldLevelRevert : GameTextKey.WorldLevelLower] }}
    </button>
    <MenuWorldLevelTips
      v-if="isWorldLevelAdjustable && isWorldLevelTipsOpen"
      class="world-level-tips"
      :game-text
      :is-world-level-lowered
      :world-level-changed-at
    />
    <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Info]" class="info-glyph" />
    <p class="birthday">{{ gameText[GameTextKey.Birthday] }}</p>
    <div class="contents">
      <button
        v-for="{ icon, screenKind } of PAIMON_MENU_CONTENTS"
        :key="screenKind"
        class="entry"
        :disabled="!checkIsBuilt(screenKind)"
        type="button"
        @click="emit('open', screenKind)"
      >
        <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
        <span class="label">{{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}</span>
      </button>
      <button v-for="{ icon, labelKey } of PAIMON_MENU_LINKS" :key="labelKey" class="entry link" disabled type="button">
        <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
        <span class="label">{{ gameText[labelKey] }}</span>
      </button>
    </div>
  </GameScreen>
  <MenuExit v-else :game-text @close="emit('close')" @quit="emit('quit')" />
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the card's stars, the avatar's art and the glass of the side bar's and
   the panel's translucent feet wait on the English PC client's menu measured at 1080 high. Every place is in the
   Reference's own pixels, a unit being 1.333 of them, so a menu is drawn as the reference is at any window's size */
.paimon-menu {
  --reference-pixel: calc(var(--unit) * 0.75);
  color: #ece5d7;
}

.side-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 92);
  background: linear-gradient(#4a5265, #4c5869 40%, #48545c 62%, #445451 88%);
}

.back {
  position: absolute;
  top: calc(var(--unit) * 18.25);
  left: calc(var(--unit) * 18.25);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #999a9b;
  cursor: inherit;
}

.back::after {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 6);
  border-radius: 50%;
  background: #ece5d7;
}

.side-entry {
  position: absolute;
  padding: 0;
  border: none;
  background: none;
  cursor: inherit;
}

.side-entry:focus-visible,
.side-entry:hover:enabled,
.back:focus-visible,
.back:hover {
  outline: none;
  background: rgb(236 229 215 / 0.2);
}

.unbuilt {
  opacity: 0.4;
}

.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 96);
  width: calc(var(--unit) * 672);
  background: #ece5d7;
}

.card {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 96);
  width: calc(var(--unit) * 672);
  height: calc(var(--unit) * 328);
  background: linear-gradient(#3a424f, #435366 30%, #4a6680 55%, #55799a 75%, #5e9cba 88%, #63a6c6);
}

.avatar {
  position: absolute;
  top: calc(var(--unit) * 41);
  left: calc(var(--unit) * 140);
  width: calc(var(--unit) * 128);
  height: calc(var(--unit) * 128);
  border: calc(var(--unit) * 4) solid rgb(236 229 215 / 0.6);
  border-radius: 50%;
  background: #dd8650;
  box-sizing: border-box;
}

.edit {
  position: absolute;
  top: calc(var(--unit) * 47);
  left: calc(var(--unit) * 703);
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  border-radius: calc(var(--unit) * 4);
  background: #ece5d7;
}

.edit-glyph {
  color: #4a5260;
}

.uid-pill {
  position: absolute;
  top: calc(var(--unit) * 196);
  left: calc(var(--unit) * 112);
  width: calc(var(--unit) * 184);
  height: calc(var(--unit) * 28);
  border: calc(var(--unit) * 2) solid rgb(236 229 215 / 0.85);
  border-radius: calc(var(--unit) * 14);
  background: rgb(67 88 113 / 0.85);
  box-sizing: border-box;
}

.uid-label {
  position: absolute;
  top: calc(var(--unit) * 199);
  left: calc(var(--unit) * 124);
  margin: 0;
  color: #ece9e1;
  font-size: calc(var(--unit) * 20);
  line-height: 1;
}

.back-glyph {
  color: #3d4655;
}

.copy-glyph {
  color: rgb(236 229 215 / 0.5);
}

.copy {
  position: absolute;
  top: calc(var(--unit) * 236);
  left: calc(var(--unit) * 191);
  padding: 0;
  border: none;
  background: none;
  color: rgb(236 229 215 / 0.5);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  line-height: 1;
}

.rank-title,
.exp-label,
.world-level,
.birthday {
  position: absolute;
  margin: 0;
  color: #e2e8ed;
  font-weight: 600;
  line-height: 1;
}

.rank-title,
.world-level,
.birthday {
  left: calc(var(--unit) * 313.5);
  font-size: calc(var(--unit) * 26);
}

.rank-title {
  top: calc(var(--unit) * 166);
}

.exp-label {
  top: calc(var(--unit) * 201);
  left: calc(var(--unit) * 349);
  color: #dbe5ec;
  font-size: calc(var(--unit) * 19);
}

.world-level {
  top: calc(var(--unit) * 246);
}

.birthday {
  top: calc(var(--unit) * 286);
}

/* The panel opens below the button, in the same reference pixels as the card */
.world-level-tips {
  top: calc(var(--unit) * 276);
  left: calc(var(--unit) * 420);
}

/* Provisional: the button's place beside the World Level waits on the English PC client's menu measured at 1080 high */
.world-level-adjust {
  position: absolute;
  top: calc(var(--unit) * 246);
  left: calc(var(--unit) * 420);
  padding: 0;
  border: none;
  background: none;
  color: #e2e8ed;
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  text-decoration: underline;
}

.info-glyph {
  color: #ece5d7;
}

.exp-bar {
  position: absolute;
  top: calc(var(--unit) * 225);
  left: calc(var(--unit) * 350);
  width: calc(var(--unit) * 387);
  height: calc(var(--unit) * 7);
  background: #334b60;
}

.exp-fill {
  height: 100%;
  background: #ccfe66;
}

.contents {
  position: absolute;
  top: calc(var(--unit) * 352.5);
  left: calc(var(--unit) * 126);
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 143));
  grid-auto-rows: calc(var(--unit) * 128);
  column-gap: calc(var(--unit) * 13);
  row-gap: calc(var(--unit) * 13.75);
}

.entry {
  position: relative;
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 2);
  background: #51596b;
  color: #ece5d7;
  cursor: inherit;
  font: inherit;
}

.label {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 10);
  left: 0;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
}

.entry:hover:enabled,
.entry:focus-visible {
  outline: none;
  background: #6c7588;
}

.entry:disabled:not(.link) {
  opacity: 0.4;
}
</style>
