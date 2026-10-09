<script setup lang="ts">
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuDialogIcon } from "#src/models/menu/MenuDialogIcon";
import { MenuPromptIcon } from "#src/models/menu/MenuPromptIcon";
import { computeWorldLevelCooldown } from "#src/services/adventureRank/computeWorldLevelCooldown";
import { MENU_DIALOG_CORNER_SCALES } from "#src/services/menu/constants";
import { MenuDialogGlyphMap } from "#src/services/menu/MenuDialogGlyphMap";
import { MenuPromptGlyphMap } from "#src/services/menu/MenuPromptGlyphMap";
import { useResizeObserver } from "@vueuse/core";
import { GameScreen } from "genshin-interface";
import { GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level can be lowered or restored at all, and whether it is lowered; the button is drawn only when
  // It can
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  // The server's clock minus this machine's, which the cooldown is read against
  serverClockOffsetMs?: number;
  // When the World Level last changed, which holds the button until its cooldown has run
  worldLevelChangedAt?: Temporal.Instant;
}

const {
  gameText,
  isWorldLevelAdjustable,
  isWorldLevelLowered,
  serverClockOffsetMs = 0,
  worldLevelChangedAt,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; toggleWorldLevel: [] }>();
const frame = useTemplateRef("frame");
const body = useTemplateRef("body");
const info = useTemplateRef("info");
// The dividers above and below the body, each a hairline ending in a star and a diamond at either side
const dividerTops = [74, 582];
const infoSegments = computed(() => splitGameTextColors(gameText[GameTextKey.WorldLevelInfo]));
// The button waits while the last change's cooldown runs, read as the dialog opens and again as a change is made
const isCoolingDown = computed(
  () =>
    computeWorldLevelCooldown(
      worldLevelChangedAt,
      Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs }),
    ) !== undefined,
);
// The scroll thumb's share of the track and how far down it stands, from the body's scroll as it stands
const scrollThumb = shallowRef({ offset: 1, share: 1 });
const updateScrollThumb = () => {
  if (!body.value) return;
  const { clientHeight, scrollHeight, scrollTop } = body.value;
  const scrollRange = scrollHeight - clientHeight;
  // The body scrolls from its end, so its top reads the negative of the range and its end 0
  scrollThumb.value = {
    offset: scrollRange > 0 ? 1 + scrollTop / scrollRange : 1,
    share: Math.min(clientHeight / scrollHeight, 1),
  };
};

useResizeObserver(info, updateScrollThumb);

// The dialog is modal over the menu, so focus starts inside it, on its frame, as nothing in it is picked yet
onMounted(() => {
  frame.value?.focus();
});
</script>

<template>
  <!-- The World Level dialog the profile card's info icon opens over the dimmed menu: its title and the cross that closes
       It, what the World Level is, scrolled to its end where the change is told, and the button that lowers the World
       Level by one or restores it, held while the last change's cooldown runs. Every place is the 1080 high recording's
       Own pixels from the frame's top left -->
  <GameScreen class="world-level-dialog" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.WorldLevel]">
    <div class="backdrop" />
    <div ref="frame" class="frame" tabindex="-1">
      <div v-for="scale of MENU_DIALOG_CORNER_SCALES" :key="scale" class="corner" :style="{ scale }">
        <MenuGlyph :glyph="MenuDialogGlyphMap[MenuDialogIcon.Corner]" class="corner-glyph" />
      </div>
      <p class="title" role="heading" aria-level="2">{{ gameText[GameTextKey.WorldLevel] }}</p>
      <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')" />
      <MenuGlyph :glyph="MenuDialogGlyphMap[MenuDialogIcon.Close]" class="close-glyph" />
      <svg
        v-for="top of dividerTops"
        :key="top"
        class="divider"
        aria-hidden="true"
        :style="{ top: `calc(var(--unit) * ${top})` }"
        viewBox="0 0 995 18"
      >
        <path
          d="M 2 9 Q 13 7.5 16 1 Q 19 7.5 30 9 Q 19 10.5 16 17 Q 13 10.5 2 9 Z M 31.5 9 L 36.5 3 L 41.5 9 L 36.5 15 Z"
        />
        <path
          d="M 993 9 Q 982 7.5 979 1 Q 976 7.5 965 9 Q 976 10.5 979 17 Q 982 10.5 993 9 Z M 963.5 9 L 958.5 3 L 953.5 9 L 958.5 15 Z"
        />
        <rect height="2" width="912" x="41.5" y="8" />
      </svg>
      <div ref="body" class="body" @scroll="updateScrollThumb()">
        <p ref="info" class="info">
          <span v-for="({ color, text }, index) of infoSegments" :key="index" :style="{ color }">{{ text }}</span>
        </p>
      </div>
      <div class="track" aria-hidden="true">
        <div
          v-if="scrollThumb.share < 1"
          class="thumb"
          :style="{
            height: `${scrollThumb.share * 100}%`,
            top: `${(1 - scrollThumb.share) * scrollThumb.offset * 100}%`,
          }"
        />
      </div>
      <svg class="caret up" aria-hidden="true" viewBox="0 0 10 5"><polyline points="1 4.25 5 0.75 9 4.25" /></svg>
      <svg class="caret down" aria-hidden="true" viewBox="0 0 10 5"><polyline points="1 0.75 5 4.25 9 0.75" /></svg>
      <button
        v-if="isWorldLevelAdjustable"
        class="adjust"
        :disabled="isCoolingDown"
        type="button"
        @click="emit('toggleWorldLevel')"
      >
        <span class="disc" />
        <MenuGlyph
          class="adjust-glyph"
          :class="{ revert: isWorldLevelLowered }"
          :glyph="MenuPromptGlyphMap[MenuPromptIcon.LowerWorldLevel]"
        />
        <span class="label">{{
          gameText[isWorldLevelLowered ? GameTextKey.WorldLevelRevert : GameTextKey.WorldLevelLower]
        }}</span>
      </button>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Measured from the English PC client's dialog at 1080 high (`world-level-dialog-2024.mkv` at 5 seconds), its frame
   Centred on the screen. Provisional where the recording does not show it: the button held through a cooldown and the
   Restoring button's arrow, the lowering's turned over */
.world-level-dialog {
  --reference-pixel: var(--unit);
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 48%);
}

/* The frame's outer band, darker than its fill, its light line 11 units in at the sides and 10 at the top and foot */
.frame {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 1078);
  height: calc(var(--unit) * 716);
  outline: none;
  background: #3c4154;
  box-shadow: 0 0 0 calc(var(--unit) * 2) rgb(0 0 0 / 0.2);
  translate: -50% -50%;
}

.frame::before {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 10) calc(var(--unit) * 11);
  border: calc(var(--unit) * 2) solid #494e5f;
  background: #3f4455;
}

/* Each corner's ornament is the top left one mirrored over the frame's middle, as the frame is symmetric */
.corner {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.corner-glyph {
  color: #ffefc0;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 28.4);
  right: 0;
  left: 0;
  margin: 0;
  color: #d3bc8e;
  font-size: calc(var(--unit) * 39.5);
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1;
  text-align: center;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--unit) * 988);
  width: calc(var(--unit) * 44);
  height: calc(var(--unit) * 42);
  padding: 0;
  border: none;
  background: none;
  cursor: inherit;
}

.close:focus-visible {
  outline: calc(var(--unit) * 2) solid #feeab0;
}

.close-glyph {
  color: #aba48d;
}

.divider {
  position: absolute;
  left: calc(var(--unit) * 41);
  width: calc(var(--unit) * 995);
  height: calc(var(--unit) * 18);
  fill: #4d5361;
}

/* The body scrolls from its end, where the game opens it, so a column laid out in reverse starts there; its lines are
   The recording's 32 units apart at a cap height of 20, spaced out to its lines' widths, and its last line's box ends
   23.5 units above the track's foot */
.body {
  position: absolute;
  top: calc(var(--unit) * 90);
  left: calc(var(--unit) * 76);
  display: flex;
  width: calc(var(--unit) * 917);
  height: calc(var(--unit) * 478);
  flex-direction: column-reverse;
  overflow-y: auto;
  scrollbar-width: none;
}

.info {
  margin: 0 0 auto;
  padding-bottom: calc(var(--unit) * 23.5);
  color: #e0e6ea;
  font-size: calc(var(--unit) * 29.3);
  font-weight: 600;
  letter-spacing: 0.036em;
  line-height: calc(var(--unit) * 32);
  white-space: pre-line;
}

.track {
  position: absolute;
  top: calc(var(--unit) * 105);
  left: calc(var(--unit) * 1021);
  width: calc(var(--unit) * 5);
  height: calc(var(--unit) * 463);
  background: #383d4e;
}

.thumb {
  position: absolute;
  left: 0;
  width: calc(var(--unit) * 6);
  background: #beb9b9;
}

.caret {
  position: absolute;
  left: calc(var(--unit) * 1018.5);
  width: calc(var(--unit) * 10);
  height: calc(var(--unit) * 5);
  fill: none;
  stroke: #5e6472;
  stroke-width: 1.5;
}

.caret.up {
  top: calc(var(--unit) * 97);
}

.caret.down {
  top: calc(var(--unit) * 571.5);
}

.adjust {
  position: absolute;
  top: calc(var(--unit) * 616);
  left: calc(var(--unit) * 354);
  width: calc(var(--unit) * 370);
  height: calc(var(--unit) * 63);
  padding: 0 0 0 calc(var(--unit) * 34);
  border: none;
  border-radius: calc(var(--unit) * 31.5);
  background: #e8e5d6;
  color: #3d3f4f;
  cursor: inherit;
  font: inherit;
}

.adjust:focus-visible {
  outline: calc(var(--unit) * 3) solid #feeab0;
  outline-offset: calc(var(--unit) * -3);
}

.adjust:disabled {
  opacity: 0.5;
}

.disc {
  position: absolute;
  top: calc(var(--unit) * 10.5);
  left: calc(var(--unit) * 10.5);
  width: calc(var(--unit) * 41);
  height: calc(var(--unit) * 41);
  border-radius: 50%;
  background: #322f2e;
}

.adjust-glyph {
  color: #f05e60;
}

.revert {
  scale: 1 -1;
}

.label {
  display: block;
  font-size: calc(var(--unit) * 30.7);
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: calc(var(--unit) * 63);
}
</style>
