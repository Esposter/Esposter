<script setup lang="ts">
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";
import type { GameText } from "genshin-text";

import { checkIsClaimable } from "#src/services/mail/checkIsClaimable";
import { checkIsGiftBoxed } from "#src/services/mail/checkIsGiftBoxed";
import { getMailExpiry } from "#src/services/mail/getMailExpiry";
import { MailExpiryUnitGameTextKeyMap } from "#src/services/mail/MailExpiryUnitGameTextKeyMap";
import { GAME_INK, GAME_ROW_HOVER, GAME_ROW_PRESS } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The held mails that are the Traveler's birthday mails, which the Gift Mail Box keeps once claimed
  birthdayMailIds: ReadonlySet<number>;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether this mail is the one the screen shows, which its tab is then marked as
  isSelected: boolean;
  // The held mail, whose read state the entry shows
  mail: MailSave;
  // The clock the mail's time left is read against
  now: Temporal.Instant;
  // The mail's row, which its text ids, items and expiry are read from
  row: Mail;
  // The mails' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { birthdayMailIds, gameText, isSelected, mail, now, row, textMap } = defineProps<Props>();
const emit = defineEmits<{ select: [mail: MailSave] }>();
// A mail in the Gift Mail Box is kept there and says so; any other mail shows its time left
const statusText = computed(() => {
  if (checkIsGiftBoxed(mail, row, birthdayMailIds)) return gameText[GameTextKey.MailGiftBox];
  const { count, unit } = getMailExpiry(mail.deliveredAt, row.expireDays, now);
  return fillGameTextValues(gameText[MailExpiryUnitGameTextKeyMap[unit]], count);
});
</script>

<template>
  <button class="entry" role="tab" type="button" :aria-selected="isSelected" @click="emit('select', mail)">
    <span class="thumb" aria-hidden="true" />
    <span class="entry-title">{{ textMap[row.titleTextId] }}</span>
    <span class="entry-sender">{{ textMap[row.senderTextId] }}</span>
    <span class="entry-status">{{ statusText }}</span>
    <span v-if="!mail.isRead" class="new" aria-hidden="true">{{ gameText[GameTextKey.New] }}</span>
    <span v-if="checkIsClaimable(mail, row)" class="unread" aria-hidden="true">!</span>
  </button>
</template>

<style scoped>
/* Each row a tab of its own, the selected one cream and the rest a dark glass */
.entry {
  position: relative;
  display: block;
  height: calc(var(--unit) * 96);
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(54 67 82 / 0.85);
  color: #fff;
  cursor: inherit;
  font: inherit;
  text-align: start;
}

.entry[aria-selected="true"] {
  height: calc(var(--unit) * 98);
  background: rgb(239 229 216);
  color: v-bind(GAME_INK);
}

.entry:not([aria-selected="true"]) {
  width: calc(var(--unit) * 733);
  margin-left: calc(var(--unit) * 10);
}

/* Lit as a row is, a tint over its own box behind its words, the selected cream too: on a pointer's hover only, so a tap
   leaves none, and on focus or the forced hover; pressed at once. Provisional, as no recording shows an entry under the
   pointer */
@media (hover: hover) {
  .entry:enabled:hover {
    background-image: linear-gradient(v-bind(GAME_ROW_HOVER), v-bind(GAME_ROW_HOVER));
  }
}

.entry:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_HOVER), v-bind(GAME_ROW_HOVER));
}

.entry:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_PRESS), v-bind(GAME_ROW_PRESS));
}

.thumb {
  position: absolute;
  top: calc(var(--unit) * 11);
  left: calc(var(--unit) * 15);
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
  background: rgb(40 46 60 / 0.55);
}

.entry-title,
.entry-sender,
.entry-status {
  position: absolute;
  margin: 0;
  white-space: nowrap;
}

.entry-title {
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 110);
  width: calc(var(--unit) * 600);
  overflow: hidden;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-overflow: ellipsis;
}

.entry-sender {
  top: calc(var(--unit) * 58);
  left: calc(var(--unit) * 141);
  font-size: calc(var(--unit) * 18);
}

.entry-status {
  top: calc(var(--unit) * 58);
  right: calc(var(--unit) * 13);
  font-size: calc(var(--unit) * 18);
}

.new {
  position: absolute;
  top: calc(var(--unit) * -1);
  right: 0;
  padding: 0 calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 4);
  background: #d9a441;
  color: #fff;
  font-size: calc(var(--unit) * 16);
  line-height: calc(var(--unit) * 24);
}

.unread {
  position: absolute;
  top: calc(var(--unit) * -4);
  right: calc(var(--unit) * -2);
  width: calc(var(--unit) * 16);
  height: calc(var(--unit) * 16);
  border-radius: 50%;
  background: #e0352b;
  color: #fff;
  font-size: calc(var(--unit) * 12);
  line-height: calc(var(--unit) * 16);
  text-align: center;
}
</style>
