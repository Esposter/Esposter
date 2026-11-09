<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { ProfileNamecard } from "#src/models/menu/ProfileNamecard";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuPaimonBack from "#src/components/Menu/Paimon/Back/Index.vue";
import MenuPaimonContents from "#src/components/Menu/Paimon/Contents/Index.vue";
import MenuPaimonOverlays from "#src/components/Menu/Paimon/Overlays/Index.vue";
import MenuPaimonProfile from "#src/components/Menu/Paimon/Profile/Index.vue";
import MenuPaimonQuit from "#src/components/Menu/Paimon/Quit/Index.vue";
import MenuPaimonSideEntry from "#src/components/Menu/Paimon/SideEntry/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import {
  PAIMON_MENU_CLOSE_MS,
  PAIMON_MENU_FADE_MS,
  PAIMON_MENU_PANEL_DELAY_MS,
  PAIMON_MENU_SIDE_BAR,
} from "#src/services/menu/constants";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GAME_SMOOTHSTEP_EASING, GameScreen } from "genshin-interface";
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
  // The server's clock minus this machine's, which the World Level's cooldown is read against
  serverClockOffsetMs?: number;
  // The signature the profile shows under the name, when the profile has one
  signature?: string;
  // The Traveler's birthday once it is set, which the row shows; until then the row offers the button that sets it
  travelerBirthday?: TravelerBirthdaySave;
  // When the World Level last changed, for the cooldown its dialog's button waits on
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  open: [screenKind: TitledScreenKind];
  pickNamecard: [itemId: number];
  quit: [];
  setBirthday: [birthday: TravelerBirthdaySave];
  toggleWorldLevel: [];
}>();
// The side bar's buttons, each with the tooltip its screen is named by in the reader's language
const sideBar = computed(() =>
  PAIMON_MENU_SIDE_BAR.map(({ icon, screenKind }) => ({
    icon,
    screenKind,
    tip: gameText[ScreenKindGameTextKeyMap[screenKind]],
  })),
);
// The easing and fades the menu's CSS animations read as custom properties on the screen
const menuStyle = {
  "--menu-ease": GAME_SMOOTHSTEP_EASING,
  "--menu-fade": `${PAIMON_MENU_FADE_MS}ms`,
  "--menu-panel-delay": `${PAIMON_MENU_PANEL_DELAY_MS}ms`,
};
const back = useTemplateRef("back");
const profile = useTemplateRef("profile");
const quitGame = useTemplateRef("quitGame");
// The World Level dialog opens over the menu from the info icon beside the World Level, and closes back to it; the menu
// Behind it is inert until it closes, so focus stays in the dialog
const isWorldLevelDialogOpen = ref(false);
// The namecard picker opens over the menu and changes the namecard the profile shows, closing back to the menu
const isNamecardDialogOpen = ref(false);
// The birthday is set once from its dialog, which closes back to the menu, and the row shows the date after that
const isBirthdayDialogOpen = ref(false);
// The info button is inert until the menu is patched, so the focus goes back to it on the tick after the dialog closes
const closeWorldLevelDialog = async () => {
  isWorldLevelDialogOpen.value = false;
  await nextTick();
  profile.value?.focusWorldLevelInfo();
};
// Quit Game opens the quit prompt over the menu, which stays behind it dimmed and inert
// Cancel closes the prompt back to the menu, and Confirm leaves through the quit event
const isExitPrompted = ref(false);
// The Quit Game button is inert until the menu is patched, so the focus goes back to it on the tick after the prompt closes
const closeExitPrompt = async () => {
  isExitPrompted.value = false;
  await nextTick();
  quitGame.value?.focusQuitGame();
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
  back.value?.focusBack();
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
    :style="menuStyle"
  >
    <div
      class="menu"
      :inert="isBirthdayDialogOpen || isNamecardDialogOpen || isWorldLevelDialogOpen || isExitPrompted || isClosing"
    >
      <div class="side-bar" />
      <MenuPaimonBack ref="back" :label="gameText[GameTextKey.Back]" @close="closeMenu()" />
      <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Back]" class="back-glyph" />
      <!-- Each side bar button is its icon's box, the icon drawn from the box's corner -->
      <MenuPaimonSideEntry
        v-for="{ icon, screenKind, tip } of sideBar"
        :key="screenKind"
        :alerted-icons
        :check-is-built
        :icon
        :screen-kind
        :tip
        @open="emit('open', screenKind)"
      />
      <MenuPaimonQuit ref="quitGame" :tip="gameText[GameTextKey.QuitGame]" @open="isExitPrompted = true" />
      <!-- The panel and everything on it, one layer so it is revealed on its own, after the side bar -->
      <div class="panel-layer">
        <div class="panel" />
        <MenuPaimonProfile
          ref="profile"
          :account-avatar-url
          :account-name
          :adventure-exp-progress
          :adventure-rank
          :alerted-icons
          :game-text
          :namecard-item-id
          :namecards
          :signature
          :traveler-birthday
          :world-level
          @open-birthday="isBirthdayDialogOpen = true"
          @open-namecard="isNamecardDialogOpen = true"
          @open-world-level="isWorldLevelDialogOpen = true"
        />
        <MenuPaimonContents
          :adventure-rank
          :alerted-icons
          :check-is-built
          :finished-main-quest-ids
          :game-text
          @open="(screenKind) => emit('open', screenKind)"
        />
      </div>
    </div>
    <MenuPaimonOverlays
      :game-text
      :is-birthday-dialog-open
      :is-exit-prompted
      :is-namecard-dialog-open
      :is-world-level-adjustable
      :is-world-level-dialog-open
      :is-world-level-lowered
      :namecard-item-id
      :namecards
      :server-clock-offset-ms
      :world-level
      :world-level-changed-at
      @close-birthday="isBirthdayDialogOpen = false"
      @close-exit="closeExitPrompt()"
      @close-namecard="isNamecardDialogOpen = false"
      @close-world-level="closeWorldLevelDialog()"
      @pick-namecard="
        (itemId) => {
          isNamecardDialogOpen = false;
          emit('pickNamecard', itemId);
        }
      "
      @quit="emit('quit')"
      @set-birthday="
        (birthday) => {
          isBirthdayDialogOpen = false;
          emit('setBirthday', birthday);
        }
      "
      @toggle-world-level="emit('toggleWorldLevel')"
    />
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

.back-glyph {
  color: #3d4655;
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
</style>
