<script setup lang="ts">
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { ProfileNamecard } from "#src/models/menu/ProfileNamecard";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuPaimonProfileBirthday from "#src/components/Menu/Paimon/Profile/Birthday/Index.vue";
import MenuPaimonProfileInfo from "#src/components/Menu/Paimon/Profile/Info/Index.vue";
import MenuPaimonProfileNamecard from "#src/components/Menu/Paimon/Profile/Namecard/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { GameTextKey } from "genshin-text";

interface Props {
  // The signed-in account's avatar and name, which the profile card shows in place of the Traveler's disc and the
  // Default name when the player is signed out
  accountAvatarUrl?: string;
  accountName: string;
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // The icons that carry a red dot; the profile's pencil shows its dot when its icon is one of them, and none is []
  alertedIcons: (MenuEntryIcon | MenuFrameIcon)[];
  // The game's words in the reader's language
  gameText: GameText;
  // The namecard the player equipped by its item id, 0 for none, and the held namecards the profile can show
  namecardItemId: number;
  namecards: ProfileNamecard[];
  // The signature the profile shows under the name, when the profile has one
  signature?: string;
  // The Traveler's birthday once it is set, which the row shows; until then the row offers the button that sets it
  travelerBirthday?: TravelerBirthdaySave;
  // The World Level the row shows
  worldLevel: number;
}

const { namecardItemId, namecards } = defineProps<Props>();
const emit = defineEmits<{ openBirthday: []; openNamecard: []; openWorldLevel: [] }>();
const equippedNamecard = computed(() => namecards.find(({ itemId }) => itemId === namecardItemId));
const info = useTemplateRef("info");
// The World Level dialog closes back to the info button, which lives in its row, so the menu focuses it through this
defineExpose({ focusWorldLevelInfo: () => info.value?.focusWorldLevelInfo() });
</script>

<template>
  <!-- The profile card, the Traveler's disc and name over the panel, with the rank, the World Level, the birthday and the
       namecard the player has set, each one a button where the game's is one -->
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
  <MenuPaimonProfileInfo ref="info" :label="gameText[GameTextKey.WorldLevel]" @open="emit('openWorldLevel')" />
  <p v-if="!equippedNamecard" class="signature">
    {{ signature || gameText[GameTextKey.FriendNoSignature] }}
  </p>
  <p class="birthday">{{ gameText[GameTextKey.Birthday] }}</p>
  <p v-if="travelerBirthday" class="birthday-value value">{{ travelerBirthday.month }}/{{ travelerBirthday.day }}</p>
  <MenuPaimonProfileBirthday
    v-else
    class="birthday-value value"
    :label="gameText[GameTextKey.BirthdaySet]"
    @open="emit('openBirthday')"
  />
  <MenuPaimonProfileNamecard
    :is-disabled="namecards.length === 0"
    :namecard-name="equippedNamecard?.name"
    @open="emit('openNamecard')"
  />
</template>

<style scoped src="../../../../styles/paimonAlert.css"></style>

<style scoped>
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
</style>
