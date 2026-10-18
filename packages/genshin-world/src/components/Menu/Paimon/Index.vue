<script setup lang="ts">
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import MenuExit from "#src/components/Menu/Exit/Index.vue";
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuWorldLevelDialog from "#src/components/Menu/WorldLevelDialog/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import {
  PAIMON_MENU_CLOSE_MS,
  PAIMON_MENU_CONTENTS,
  PAIMON_MENU_FADE_MS,
  PAIMON_MENU_LINKS,
  PAIMON_MENU_PANEL_DELAY_MS,
  PAIMON_MENU_SIDE_BAR,
} from "#src/services/menu/constants";
import { getMenuGlyphStyle } from "#src/services/menu/getMenuGlyphStyle";
import { MenuEntryGlyphMap } from "#src/services/menu/MenuEntryGlyphMap";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GAME_SMOOTHSTEP_EASING, GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The signed-in account's avatar and name, which the profile card shows in place of the Traveler's disc and the
  // Default name when the player is signed out
  accountAvatarUrl?: string;
  accountName?: string;
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // Whether a screen is built, which its entry opens; an unbuilt one's entry is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The game's words in the reader's language
  gameText: GameText;
  // A state every entry is drawn in, forced by a fixture; a reader's pointer sets it itself
  interactionState?: InteractionState;
  // Whether the World Level can be lowered or restored at all, and whether it is lowered, for its dialog's button
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // The server's clock minus this machine's, which the World Level's cooldown is read against
  serverClockOffsetMs?: number;
  // When the World Level last changed, for the cooldown its dialog's button waits on
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

const {
  accountAvatarUrl,
  accountName,
  adventureExpProgress,
  adventureRank,
  checkIsBuilt,
  gameText,
  interactionState,
  isWorldLevelAdjustable,
  isWorldLevelLowered,
  worldLevel,
  worldLevelChangedAt,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; open: [screenKind: TitledScreenKind]; quit: []; toggleWorldLevel: [] }>();
const backButton = useTemplateRef("backButton");
const worldLevelInfoButton = useTemplateRef("worldLevelInfoButton");
// The World Level dialog opens over the menu from the info icon beside the World Level, and closes back to it; the menu
// Behind it is inert until it closes, so focus stays in the dialog
const isWorldLevelDialogOpen = ref(false);
// The info button is inert until the menu is patched, so the focus goes back to it on the tick after the dialog closes
const closeWorldLevelDialog = async () => {
  isWorldLevelDialogOpen.value = false;
  await nextTick();
  worldLevelInfoButton.value?.focus();
};
// Quit Game opens the quit prompt over the menu, which stays behind it dimmed and inert
// Cancel closes the prompt back to the menu, and Confirm leaves through the quit event
const isExitPrompted = ref(false);
const quitGameButton = useTemplateRef("quitGameButton");
// The Quit Game button is inert until the menu is patched, so the focus goes back to it on the tick after the prompt closes
const closeExitPrompt = async () => {
  isExitPrompted.value = false;
  await nextTick();
  quitGameButton.value?.focus();
};
// Back plays the menu's closing before it closes the world, the side bar and the panel fading out as they came in
const isClosing = ref(false);
let closeTimeout: ReturnType<typeof setTimeout> | undefined;
const closeMenu = () => {
  if (isClosing.value) return;
  isClosing.value = true;
  closeTimeout = setTimeout(() => emit("close"), PAIMON_MENU_CLOSE_MS);
};
// The menu is a dialog over the world, so focus starts inside it, on its way back
onMounted(() => {
  backButton.value?.focus();
});
onBeforeUnmount(() => {
  clearTimeout(closeTimeout);
});
</script>

<template>
  <!-- The game's pause menu, laid out in the reference's own pixels: its side bar down the left, of Back, the side bar's
       Screens and Quit Game, the profile card over the panel's entries in the game's four columns, and the world drawn
       Past the panel, where Paimon floats. Every entry the game has is here in its order: one whose screen is not built
       Yet is drawn disabled, and the links out to web pages are drawn disabled whole -->
  <GameScreen
    :class="{ closing: isClosing }"
    class="paimon-menu"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.Paimon]"
    :interaction-state
    :style="{
      '--menu-ease': GAME_SMOOTHSTEP_EASING,
      '--menu-fade': `${PAIMON_MENU_FADE_MS}ms`,
      '--menu-panel-delay': `${PAIMON_MENU_PANEL_DELAY_MS}ms`,
    }"
  >
    <div class="menu" :inert="isWorldLevelDialogOpen || isExitPrompted || isClosing">
      <div class="side-bar" />
      <GameButton
        ref="backButton"
        class="back"
        :aria-label="gameText[GameTextKey.Back]"
        :kind="GameButtonKind.Plain"
        @click="closeMenu()"
      />
      <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Back]" class="back-glyph" />
      <!-- Each side bar button is its icon's box, the icon drawn from the box's corner -->
      <GameButton
        v-for="{ icon, screenKind } of PAIMON_MENU_SIDE_BAR"
        :key="screenKind"
        class="side-entry"
        :disabled="!checkIsBuilt(screenKind)"
        :kind="GameButtonKind.Disc"
        :style="getMenuGlyphStyle(MenuFrameGlyphMap[icon])"
        :tip="gameText[ScreenKindGameTextKeyMap[screenKind]]"
        @click="emit('open', screenKind)"
      >
        <MenuGlyph :glyph="{ ...MenuFrameGlyphMap[icon], x: 0, y: 0 }" />
      </GameButton>
      <GameButton
        class="side-entry"
        :kind="GameButtonKind.Disc"
        :style="getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Quit])"
        ref="quitGameButton"
        :tip="gameText[GameTextKey.QuitGame]"
        @click="isExitPrompted = true"
      >
        <MenuGlyph :glyph="{ ...MenuFrameGlyphMap[MenuFrameIcon.Quit], x: 0, y: 0 }" />
      </GameButton>
      <!-- The panel and everything on it, one layer so it is revealed on its own, after the side bar -->
      <div class="panel-layer">
        <div class="panel" />
        <div class="card" />
        <img v-if="accountAvatarUrl" :alt="accountName" class="avatar-image" :src="accountAvatarUrl" />
        <div v-else class="avatar" />
        <p class="name">{{ accountName ?? gameText[GameTextKey.PlayerDefaultName] }}</p>
        <div class="edit" />
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Edit]" class="edit-glyph" />
        <p class="uid-label">{{ gameText[GameTextKey.Uid] }}</p>
        <div class="uid-pill" />
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Copy]" class="copy-glyph" />
        <button class="copy" disabled type="button">{{ gameText[GameTextKey.Copy] }}</button>
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.ExpBadge]" />
        <p class="rank-title">{{ gameText[GameTextKey.AdventureRank] }}</p>
        <p class="rank-title value">{{ adventureRank }}</p>
        <p class="exp-label">{{ gameText[GameTextKey.AdventureExp] }}</p>
        <div class="exp-bar"><div class="exp-fill" :style="{ width: `${adventureExpProgress * 100}%` }" /></div>
        <p class="world-level">{{ gameText[GameTextKey.WorldLevel] }}</p>
        <p class="world-level value">{{ worldLevel }}</p>
        <GameButton
          ref="worldLevelInfoButton"
          class="info"
          :aria-label="gameText[GameTextKey.WorldLevel]"
          :kind="GameButtonKind.Plain"
          :style="getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Info])"
          @click="isWorldLevelDialogOpen = true"
        />
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Info]" class="info-glyph" />
        <p class="birthday">{{ gameText[GameTextKey.Birthday] }}</p>
        <div class="contents">
          <GameButton
            v-for="{ icon, screenKind } of PAIMON_MENU_CONTENTS"
            :key="screenKind"
            class="entry"
            :disabled="!checkIsBuilt(screenKind)"
            :kind="GameButtonKind.Row"
            @click="emit('open', screenKind)"
          >
            <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
            <span class="label">{{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}</span>
          </GameButton>
          <GameButton
            v-for="{ icon, labelKey } of PAIMON_MENU_LINKS"
            :key="labelKey"
            class="entry link"
            disabled
            :kind="GameButtonKind.Row"
          >
            <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
            <span class="label">{{ gameText[labelKey] }}</span>
          </GameButton>
        </div>
      </div>
    </div>
    <MenuWorldLevelDialog
      v-if="isWorldLevelDialogOpen"
      :game-text
      :is-world-level-adjustable
      :is-world-level-lowered
      :server-clock-offset-ms
      :world-level-changed-at
      @close="closeWorldLevelDialog()"
      @toggle-world-level="emit('toggleWorldLevel')"
    />
    <MenuExit v-if="isExitPrompted" :game-text @close="closeExitPrompt()" @quit="emit('quit')" />
  </GameScreen>
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the card's stars, the avatar's art and the glass of the side bar's and
   the panel's translucent feet wait on the English PC client's menu measured at 1080 high. Every place is in the
   Reference's own pixels, a unit being 1.333 of them, so a menu is drawn as the reference is at any window's size */
.paimon-menu {
  --reference-pixel: calc(var(--unit) * 0.75);
  color: #ece5d7;
}

/* The menu's own pieces, placed against the screen as if the wrapper that makes them inert under the dialog were not there */
.menu {
  display: contents;
}

/* The opening fades the side bar in and the panel in once PAIMON_MENU_PANEL_DELAY_MS has passed; closing runs the same
   Two in reverse, the panel first. The layer takes no pointer, its children do, so the side bar under it still answers */
.panel-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: menu-fade-in var(--menu-fade) var(--menu-ease) var(--menu-panel-delay) both;
}

.panel-layer > * {
  pointer-events: auto;
}

.menu > :not(.panel-layer) {
  animation: menu-fade-in var(--menu-fade) var(--menu-ease) both;
}

.closing .panel-layer {
  animation: menu-fade-out var(--menu-fade) var(--menu-ease) both;
}

.closing .menu > :not(.panel-layer) {
  animation: menu-fade-out var(--menu-fade) var(--menu-ease) var(--menu-panel-delay) both;
}

@keyframes menu-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes menu-fade-out {
  to {
    opacity: 0;
  }
}

.side-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 92);
  background: linear-gradient(#4a5265, #4c5869 40%, #48545c 62%, #445451 88%);
}

/* Provisional: no recording shows Back hovered or pressed, so it is drawn with no state of its own */
.back {
  position: absolute;
  top: calc(var(--unit) * 18.25);
  left: calc(var(--unit) * 18.25);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  border-radius: 50%;
  background: #999a9b;
}

.back::after {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 6);
  border-radius: 50%;
  background: #ece5d7;
}

/* Above the panel, which a lit button's name reaches over */
.side-entry {
  position: absolute;
  z-index: 1;
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

/* The account's own picture fills the Traveler's disc, cropped to it */
.avatar-image {
  object-fit: cover;
}

.avatar,
.avatar-image {
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

/* Provisional: the name's top and size are read beside the card's avatar, to be fitted to the whole frame by the parity
   Compare */
.name {
  position: absolute;
  top: calc(var(--unit) * 52);
  left: calc(var(--unit) * 313.5);
  margin: 0;
  color: #e2e8ed;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  line-height: 1;
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

/* The rank's and the World Level's values end where the current client's do, 17 units left of the info disc, at its
   Cap height of 19 units (`world-level-dialog-2024.mkv` at 2 seconds) */
.value {
  left: calc(var(--unit) * 688);
  font-size: calc(var(--unit) * 28);
  translate: -100% 0;
}

/* The game draws the info icon the same hovered and pressed: its disc reads #eae4d6 throughout, from the pointer's
   Arrival to the click that opens the dialog (`world-level-dialog-2024.mkv`, 0.9 to 3.0 seconds at 60 frames) */
.info {
  position: absolute;
  border-radius: 50%;
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
  border-radius: calc(var(--unit) * 2);
  background: #51596b;
  color: #ece5d7;
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

.entry:disabled:not(.link) {
  opacity: 0.4;
}
</style>
