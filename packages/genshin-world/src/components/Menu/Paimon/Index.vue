<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { ProfileNamecard } from "#src/models/profile/ProfileNamecard";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import MenuBirthdayDialog from "#src/components/Menu/BirthdayDialog/Index.vue";
import MenuExit from "#src/components/Menu/Exit/Index.vue";
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuNamecardDialog from "#src/components/Menu/NamecardDialog/Index.vue";
import MenuWorldLevelDialog from "#src/components/Menu/WorldLevelDialog/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { checkIsSystemOpen } from "#src/services/adventureRank/checkIsSystemOpen";
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
  accountName: string;
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // The icons that carry a red dot, the news the player has not seen, among the entries, the links, the side bar and the
  // Profile's pencil; none is []
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // Whether a screen is built, which its entry opens; an unbuilt one's entry is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The main quests the player has finished, which the systems a quest opens are gated on
  finishedMainQuestIds: ReadonlySet<number>;
  // The game's words in the reader's language
  gameText: GameText;
  // A state every entry is drawn in, forced by a fixture; a reader's pointer sets it itself
  interactionState?: InteractionState;
  // Whether the World Level can be lowered or restored at all, and whether it is lowered, for its dialog's button
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // The namecard the player equipped by its item id, 0 for none, and the held namecards the profile can show
  namecardItemId: number;
  namecards: ProfileNamecard[];
  // The signature the profile shows under the name, when the profile has one
  signature?: string;
  // The server's clock minus this machine's, which the World Level's cooldown is read against
  serverClockOffsetMs?: number;
  // The Traveler's birthday once it is set, which the row shows; until then the row offers the button that sets it
  travelerBirthday?: TravelerBirthdaySave;
  // When the World Level last changed, for the cooldown its dialog's button waits on
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

const {
  accountAvatarUrl,
  accountName,
  adventureExpProgress,
  adventureRank,
  alertedIcons,
  checkIsBuilt,
  finishedMainQuestIds,
  gameText,
  interactionState,
  isWorldLevelAdjustable,
  isWorldLevelLowered,
  namecardItemId,
  namecards,
  signature,
  travelerBirthday,
  worldLevel,
  worldLevelChangedAt,
} = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  open: [screenKind: TitledScreenKind];
  pickNamecard: [itemId: number];
  quit: [];
  setBirthday: [birthday: TravelerBirthdaySave];
  toggleWorldLevel: [];
}>();
// The contents the player's rank and quests have opened, in the game's order: a system not open yet is not drawn at all
const openContents = computed(() =>
  PAIMON_MENU_CONTENTS.filter(({ screenKind }) => checkIsSystemOpen(screenKind, adventureRank, finishedMainQuestIds)),
);
// Quit is anchored from the bottom edge, as the frame anchors it: its box stands 36 of the 1440 high still's pixels above
// That still's bottom, each still pixel drawn at `--reference-pixel`, which puts its centre 55 units above the frame's bottom
const quitStyle = {
  ...getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Quit]),
  bottom: "calc(var(--reference-pixel) * 36)",
  top: "auto",
};
const backButton = useTemplateRef("backButton");
const worldLevelInfoButton = useTemplateRef("worldLevelInfoButton");
// The World Level dialog opens over the menu from the info icon beside the World Level, and closes back to it; the menu
// Behind it is inert until it closes, so focus stays in the dialog
const isWorldLevelDialogOpen = ref(false);
// The namecard the profile shows is the held one the player equipped, and its picker changes it, closing back to the menu
const isNamecardDialogOpen = ref(false);
const equippedNamecard = computed(() => namecards.find(({ itemId }) => itemId === namecardItemId));
const pickNamecard = (itemId: number) => {
  isNamecardDialogOpen.value = false;
  emit("pickNamecard", itemId);
};
// The birthday is set once from its dialog, which closes back to the menu, and the row shows the date after that
const isBirthdayDialogOpen = ref(false);
const setBirthday = (birthday: TravelerBirthdaySave) => {
  isBirthdayDialogOpen.value = false;
  emit("setBirthday", birthday);
};
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
       past the panel, where Paimon floats. Every entry the player's rank and quests have opened is here in its order: one
       whose screen is not built yet is drawn disabled, and the links out to web pages are drawn disabled whole -->
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
    <div
      class="menu"
      :inert="isBirthdayDialogOpen || isNamecardDialogOpen || isWorldLevelDialogOpen || isExitPrompted || isClosing"
    >
      <div class="side-bar" />
      <GameButton
        ref="backButton"
        class="back"
        tip=""
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
        <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
      </GameButton>
      <GameButton
        ref="quitGameButton"
        class="side-entry"
        :kind="GameButtonKind.Disc"
        :style="quitStyle"
        :tip="gameText[GameTextKey.QuitGame]"
        @click="isExitPrompted = true"
      >
        <MenuGlyph :glyph="{ ...MenuFrameGlyphMap[MenuFrameIcon.Quit], x: 0, y: 0 }" />
      </GameButton>
      <!-- The panel and everything on it, one layer so it is revealed on its own, after the side bar -->
      <div class="panel-layer">
        <div class="panel" />
        <div class="card" />
        <NuxtImg v-if="accountAvatarUrl" :alt="accountName" class="avatar-image" :src="accountAvatarUrl" />
        <div v-else class="avatar" />
        <p class="name">{{ accountName || gameText[GameTextKey.PlayerDefaultName] }}</p>
        <div class="edit">
          <span v-if="alertedIcons.includes(MenuFrameIcon.Edit)" aria-hidden="true" class="alert" />
        </div>
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
          tip=""
          :aria-label="gameText[GameTextKey.WorldLevel]"
          :kind="GameButtonKind.Plain"
          :style="getMenuGlyphStyle(MenuFrameGlyphMap[MenuFrameIcon.Info])"
          @click="isWorldLevelDialogOpen = true"
        />
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Info]" class="info-glyph" />
        <p v-if="!equippedNamecard" class="signature">
          {{ signature || gameText[GameTextKey.FriendNoSignature] }}
        </p>
        <p class="birthday">{{ gameText[GameTextKey.Birthday] }}</p>
        <p v-if="travelerBirthday" class="birthday-value value">
          {{ travelerBirthday.month }}/{{ travelerBirthday.day }}
        </p>
        <GameButton
          v-else
          class="birthday-value value"
          tip=""
          :aria-label="gameText[GameTextKey.BirthdaySet]"
          :kind="GameButtonKind.Plain"
          @click="isBirthdayDialogOpen = true"
        >
          -/-
        </GameButton>
        <GameButton
          class="namecard"
          tip=""
          :disabled="namecards.length === 0"
          :kind="GameButtonKind.Plain"
          @click="isNamecardDialogOpen = true"
        >
          {{ equippedNamecard?.name }}
        </GameButton>
        <div class="contents">
          <GameButton
            v-for="{ icon, screenKind } of openContents"
            :key="screenKind"
            class="entry"
            tip=""
            :disabled="!checkIsBuilt(screenKind)"
            :kind="GameButtonKind.Row"
            @click="emit('open', screenKind)"
          >
            <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
            <span class="label">{{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}</span>
            <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
          </GameButton>
          <GameButton
            v-for="{ icon, labelKey } of PAIMON_MENU_LINKS"
            :key="labelKey"
            class="entry link"
            tip=""
            disabled
            :kind="GameButtonKind.Row"
          >
            <MenuGlyph :glyph="MenuEntryGlyphMap[icon]" />
            <span class="label">{{ gameText[labelKey] }}</span>
            <span v-if="alertedIcons.includes(icon)" aria-hidden="true" class="alert" />
          </GameButton>
        </div>
      </div>
    </div>
    <MenuBirthdayDialog
      v-if="isBirthdayDialogOpen"
      :game-text
      @close="isBirthdayDialogOpen = false"
      @confirm="(birthday) => setBirthday(birthday)"
    />
    <MenuNamecardDialog
      v-if="isNamecardDialogOpen"
      :game-text
      :namecard-item-id
      :namecards
      @close="isNamecardDialogOpen = false"
      @pick="(itemId) => pickNamecard(itemId)"
    />
    <MenuWorldLevelDialog
      v-if="isWorldLevelDialogOpen"
      :game-text
      :is-world-level-adjustable
      :is-world-level-lowered
      :server-clock-offset-ms
      :world-level
      :world-level-changed-at
      @close="closeWorldLevelDialog()"
      @toggle-world-level="emit('toggleWorldLevel')"
    />
    <MenuExit v-if="isExitPrompted" :game-text @close="closeExitPrompt()" @quit="emit('quit')" />
  </GameScreen>
</template>

<style scoped>
/* The reference is the 2026 frame at 25 seconds, 1920 by 1080, with the game's window pillarboxed 150 pixels in; the page places
   the menu at that window's left edge, so its layout is in the frame's own pixels, a unit being one, and its icons are traced from
   the 1440 high still, each of whose pixels the frame draws at 0.79 of one, so an icon's box reads `--reference-pixel` */
.paimon-menu {
  --reference-pixel: calc(var(--unit) * 0.79);
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
  width: calc(var(--unit) * 100);
  background: linear-gradient(#3e4a5a, #4b5464 18%, #47596c 55%, #446071 74%, #426a76 93%, #3f6a75);
}

/* Provisional: no recording shows Back hovered or pressed, so it is drawn with no state of its own */
.back {
  position: absolute;
  top: calc(var(--unit) * 19.5);
  left: calc(var(--unit) * 21);
  width: calc(var(--unit) * 61);
  height: calc(var(--unit) * 61);
  border-radius: 50%;
  background: #999a9b;
}

.back::after {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 6.3);
  border-radius: 50%;
  background: #ece5d7;
}

/* Above the panel, which a lit button's name reaches over */
.side-entry {
  position: absolute;
  z-index: 1;
}

/* The panel is translucent over the world down its feet, which the page does not draw, so its colour is a gradient
   Measured down the reference's gap columns between the tiles, top to bottom */
.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 101);
  width: calc(var(--unit) * 708);
  background: linear-gradient(
    #ece5d7 32%,
    #e7e5d6 37%,
    #f0e3d8 46%,
    #eae4d6 56%,
    #ede3d3 65%,
    #e9e1d1 72%,
    #dbdfd0 79%,
    #d8ded5 84%,
    #dadfd4 96%,
    #d3d8cb
  );
}

.card {
  position: absolute;
  top: calc(var(--unit) * 12);
  left: calc(var(--unit) * 101);
  width: calc(var(--unit) * 708);
  height: calc(var(--unit) * 334);
  background: linear-gradient(
    #433f4e,
    #3b434f 8%,
    #37414d 16%,
    #3b4756 23%,
    #3f5262 31%,
    #43586c 38%,
    #485e77 46%,
    #4e708b 61%,
    #4e758c 75%,
    #557da0 84%,
    #6696bd 92%,
    #679fc2 98%,
    #70a5cb
  );
}

/* The account's own picture fills the Traveler's disc, cropped to it */
.avatar-image {
  object-fit: cover;
}

.avatar,
.avatar-image {
  position: absolute;
  top: calc(var(--unit) * 45);
  left: calc(var(--unit) * 151);
  width: calc(var(--unit) * 131);
  height: calc(var(--unit) * 131);
  border: calc(var(--unit) * 3) solid rgb(236 229 215 / 0.9);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 45%, #f4ecd8 0%, #efe0c6 40%, #dd9a6a 75%, #d98d5c 100%);
  box-sizing: border-box;
}

/* The pencil's square, its red dot over the square's top right corner */
.edit {
  position: absolute;
  top: calc(var(--unit) * 49);
  left: calc(var(--unit) * 741);
  width: calc(var(--unit) * 37);
  height: calc(var(--unit) * 37);
  border-radius: calc(var(--unit) * 4);
  background: #ece5d7;
}

.edit .alert {
  top: calc(var(--unit) * -14);
  left: calc(100% - var(--unit) * 10);
}

.edit-glyph {
  color: #4a5260;
}

.uid-pill {
  position: absolute;
  top: calc(var(--unit) * 206);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 191);
  height: calc(var(--unit) * 29);
  border: calc(var(--unit) * 2) solid rgb(236 229 215 / 0.85);
  border-radius: calc(var(--unit) * 15);
  background: rgb(67 88 113 / 0.85);
  box-sizing: border-box;
}

.uid-label {
  position: absolute;
  top: calc(var(--unit) * 209);
  left: calc(var(--unit) * 134);
  margin: 0;
  color: #ece9e1;
  font-size: calc(var(--unit) * 21);
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
  top: calc(var(--unit) * 249);
  left: calc(var(--unit) * 202);
  padding: 0;
  border: none;
  background: none;
  color: rgb(236 229 215 / 0.5);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 23);
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
  left: calc(var(--unit) * 330);
  font-size: calc(var(--unit) * 27);
  letter-spacing: calc(var(--unit) * 1.5);
}

/* Provisional: the name's top and size are read beside the card's avatar, to be fitted to the whole frame by the parity
   Compare. The frame's name is the recording's player, so the page draws the Traveler's default name in its place */
.name {
  position: absolute;
  top: calc(var(--unit) * 52);
  left: calc(var(--unit) * 330);
  margin: 0;
  color: #e2e8ed;
  font-size: calc(var(--unit) * 38);
  font-weight: 600;
  line-height: 1;
}

.rank-title {
  top: calc(var(--unit) * 175);
}

.exp-label {
  top: calc(var(--unit) * 212);
  left: calc(var(--unit) * 368);
  color: #dbe5ec;
  font-size: calc(var(--unit) * 20);
  letter-spacing: calc(var(--unit) * 0.4);
}

.world-level {
  top: calc(var(--unit) * 259);
}

.birthday {
  top: calc(var(--unit) * 301);
}

/* The birthday's date, or the dash that sets it once: it sits on the Birthday row, its value right aligned as the rank's is */
.birthday-value {
  position: absolute;
  top: calc(var(--unit) * 301);
  margin: 0;
}

/* The signature line under the name, at the reference's left edge and cap line; the namecard's button takes its place when a namecard is equipped */
.signature {
  position: absolute;
  top: calc(var(--unit) * 105);
  left: calc(var(--unit) * 331);
  margin: 0;
  color: #cdd5de;
  font-size: calc(var(--unit) * 21);
  letter-spacing: calc(var(--unit) * 2.4);
  line-height: 1;
}

/* Provisional: the namecard's button takes the signature line's place, drawn when a namecard is equipped */
.namecard {
  position: absolute;
  top: calc(var(--unit) * 105);
  left: calc(var(--unit) * 331);
  width: calc(var(--unit) * 300);
  color: #e2e8ed;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  text-align: left;
}

/* The rank's and the Birthday's values end 33 units short of the panel's right edge, and the World Level's 18 units left of its
   Info disc, as the frame sets them */
.value {
  left: calc(var(--unit) * 776);
  font-size: calc(var(--unit) * 29.5);
  translate: -100% 0;
}

.world-level.value {
  left: calc(var(--unit) * 725);
}

/* The game draws the info icon the same hovered and pressed: its disc reads #eae4d6 throughout, from the pointer's
   Arrival to the click that opens the dialog (`yt-P13s7kSmVOE-world-level-dialog-2024.mkv`, 0.9 to 3.0 seconds at 60 frames) */
.info {
  position: absolute;
  border-radius: 50%;
}

.info-glyph {
  color: #ece5d7;
}

.exp-bar {
  position: absolute;
  top: calc(var(--unit) * 237);
  left: calc(var(--unit) * 369);
  width: calc(var(--unit) * 408);
  height: calc(var(--unit) * 7);
  background: #334b60;
}

.exp-fill {
  height: 100%;
  background: #ccfe66;
}

/* The grid of four columns, each tile 151 pixels wide and 135 high, at the frame's pitch of 164.33 by 149 */
.contents {
  position: absolute;
  top: calc(var(--unit) * 372);
  left: calc(var(--unit) * 131);
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 151));
  grid-auto-rows: calc(var(--unit) * 135);
  column-gap: calc(var(--unit) * 13.3);
  row-gap: calc(var(--unit) * 14);
}

.entry {
  position: relative;
  border-radius: calc(var(--unit) * 2);
  background: #51596b;
  color: #ece5d7;
}

.label {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 10.5);
  left: 0;
  font-size: calc(var(--unit) * 23);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 0.4);
  line-height: 1.1;
  text-align: center;
  color: #c8c4bb;
}

/* The red dot the frame draws over an entry with news, its centre 5 units in from the top right corner and 4 down */
.alert {
  position: absolute;
  top: calc(var(--unit) * -7);
  left: calc(100% - var(--unit) * 16);
  z-index: 1;
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 22);
  border-radius: 50%;
  background: #e0302f;
  color: #fff;
  font-size: calc(var(--unit) * 16);
  font-weight: 700;
  line-height: calc(var(--unit) * 22);
  text-align: center;
}

.alert::before {
  content: "!";
}

.entry:disabled:not(.link) {
  opacity: 0.4;
}
</style>
