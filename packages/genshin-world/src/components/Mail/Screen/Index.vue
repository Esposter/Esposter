<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailEntry } from "#src/models/mail/MailEntry";
import type { MailSave } from "#src/models/mail/MailSave";
import type { GameText } from "genshin-text";

import MailScreenDetail from "#src/components/Mail/Screen/Detail/Index.vue";
import MailScreenEntry from "#src/components/Mail/Screen/Entry/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { checkIsClaimable } from "#src/services/mail/checkIsClaimable";
import { checkIsGiftBoxed } from "#src/services/mail/checkIsGiftBoxed";
import { checkIsSameHeldMail } from "#src/services/mail/checkIsSameHeldMail";
import { MAX_MAIL_COUNT } from "#src/services/mail/constants";
import { deleteReadMails } from "#src/services/mail/deleteReadMails";
import { sortMails } from "#src/services/mail/sortMails";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { ID_SEPARATOR } from "@esposter/shared";
import { CloseButton, CloseButtonMark, GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The held mails that are the Traveler's birthday mails, which the Gift Mail Box keeps once claimed
  birthdayMailIds: ReadonlySet<number>;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the last claim was refused for want of room in the bag
  isBagFull: boolean;
  // Each held mail's row, by its id, which the mail's text ids, items and expiry are read from
  mailRows: ReadonlyMap<number, Mail>;
  mails: readonly MailSave[];
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The name texts of the items, in the reader's language, by their text id
  names: Readonly<Record<string, string>>;
  // The clock the mails' time left is read against
  now: Temporal.Instant;
  // The mails' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { birthdayMailIds, gameText, isBagFull, mailRows, mails, materialDataMap, names, now, textMap } =
  defineProps<Props>();
const emit = defineEmits<{
  claim: [mail: MailSave];
  claimAll: [];
  close: [];
  deleteGift: [mail: MailSave];
  deleteRead: [];
  pin: [mail: MailSave];
  read: [mail: MailSave];
}>();
// Each held mail with its row, pinned first, so a mail with no row is never listed
const sortedEntries = computed<MailEntry[]>(() =>
  sortMails(mails).flatMap((mail) => {
    const row = mailRows.get(mail.id);
    return row ? [{ mail, row }] : [];
  }),
);
const selectedMail = ref<MailSave>();
// Each delivery of a mail is an entry of its own, so the key takes the delivery as well as the mail's id
const getEntryKey = ({ mail }: MailEntry): string => [mail.id, mail.deliveredAt].join(ID_SEPARATOR);
const checkIsSelected = (mail: MailSave): boolean =>
  selectedMail.value !== undefined && checkIsSameHeldMail(mail, selectedMail.value);
// Delete Read asks first, and the screen's owner hears of it only once the player confirms
const isConfirmingDeleteRead = ref(false);
// Delete on a Gift Mail Box mail asks first, the same way, and closes when the player picks another mail or tab
const isConfirmingDeleteGift = ref(false);
// The Mailbox tab lists the mails outside the Gift Mail Box, and the Gift Mail Box tab the mails inside it
const isGiftBoxTab = ref(false);
const visibleEntries = computed(() =>
  sortedEntries.value.filter(({ mail, row }) => checkIsGiftBoxed(mail, row, birthdayMailIds) === isGiftBoxTab.value),
);
const selectedEntry = computed(
  () => visibleEntries.value.find(({ mail }) => checkIsSelected(mail)) ?? visibleEntries.value[0],
);
const hasClaimable = computed(() => sortedEntries.value.some(({ mail, row }) => checkIsClaimable(mail, row)));
const hasDeletableMail = computed(() => deleteReadMails(mails, mailRows, birthdayMailIds).length < mails.length);
const mailGlyph = MenuFrameGlyphMap[MenuFrameIcon.Mail];
const selectTab = (isGift: boolean) => {
  isGiftBoxTab.value = isGift;
  isConfirmingDeleteGift.value = false;
};
</script>

<template>
  <!-- The game's mailbox, which the Paimon menu opens: its header with the Mailbox and Gift Mail Box tabs and the close
       mark, its mails down the left, pinned first and each with its sender and time left, and the selected mail on the
       right with its text, its date and the items it gives, claimed once. Claim All claims every mail's items the bag can
       take, and Delete Read, once confirmed, removes every read mail with nothing left to claim. Delete on a Gift Mail Box
       mail, once its warning is confirmed, removes that one mail. A pin keeps a mail at the top of the list. The header's
       envelope and its help and folder marks, the list's star and person marks, the item icons and the button icons are
       the game's own art, which does not ship, so their places stay bare; the pills' dark discs are the pill's own disc
       (`pill-disc`), and the pin's cream disc is a plain shape, drawn here -->
  <GameScreen class="mail-screen">
    <span class="band" />
    <svg class="mailbox-glyph" aria-hidden="true" viewBox="0 0 72 56" preserveAspectRatio="none">
      <path v-for="path of mailGlyph.paths" :key="path" :d="path" />
    </svg>
    <GameButton
      class="mailbox-tab"
      :aria-pressed="!isGiftBoxTab"
      :kind="GameButtonKind.Plain"
      tip=""
      @click="selectTab(false)"
    >
      {{ gameText[GameTextKey.MailBox] }}
    </GameButton>
    <GameButton
      class="gift-box-tab"
      :aria-pressed="isGiftBoxTab"
      :kind="GameButtonKind.Plain"
      tip=""
      @click="selectTab(true)"
    >
      {{ gameText[GameTextKey.MailGiftBox] }}
    </GameButton>
    <p class="mail-count">
      {{ gameText[GameTextKey.MailItems] }}
      <span>{{ mails.length }}/{{ MAX_MAIL_COUNT }}</span>
    </p>
    <CloseButton
      class="close"
      :label="gameText[GameTextKey.Back]"
      :mark="CloseButtonMark.Cross"
      @click="emit('close')"
    />
    <p v-if="isBagFull" class="notice">{{ gameText[GameTextKey.BagFull] }}</p>
    <p v-if="mails.length >= MAX_MAIL_COUNT" class="notice">{{ gameText[GameTextKey.MailFull] }}</p>
    <div class="list" role="tablist" aria-orientation="vertical">
      <MailScreenEntry
        v-for="entry of visibleEntries"
        :key="getEntryKey(entry)"
        :birthday-mail-ids
        :game-text
        :is-selected="selectedEntry !== undefined && checkIsSameHeldMail(entry.mail, selectedEntry.mail)"
        :mail="entry.mail"
        :now
        :row="entry.row"
        :text-map
        @select="
          (mail) => {
            selectedMail = mail;
            isConfirmingDeleteGift = false;
            emit('read', mail);
          }
        "
      />
    </div>
    <div v-if="visibleEntries.length === 0" class="empty">
      <p class="empty-title">{{ gameText[GameTextKey.MailNoMail] }}</p>
      <p>{{ gameText[GameTextKey.MailNoMailDescription] }}</p>
    </div>
    <section
      v-if="isConfirmingDeleteRead"
      class="confirm"
      role="dialog"
      aria-modal="true"
      :aria-label="gameText[GameTextKey.MailDeleteRead]"
    >
      <p class="confirm-text">{{ gameText[GameTextKey.MailDeleteReadConfirm] }}</p>
      <GameButton class="cancel" :kind="GameButtonKind.Pill" tip="" @click="isConfirmingDeleteRead = false">
        {{ gameText[GameTextKey.Cancel] }}
      </GameButton>
      <GameButton
        class="confirm-button"
        :kind="GameButtonKind.Pill"
        tip=""
        @click="
          () => {
            isConfirmingDeleteRead = false;
            emit('deleteRead');
          }
        "
      >
        {{ gameText[GameTextKey.Confirm] }}
      </GameButton>
    </section>
    <MailScreenDetail
      v-if="selectedEntry"
      v-model:is-confirming-delete-gift="isConfirmingDeleteGift"
      :birthday-mail-ids
      :entry="selectedEntry"
      :game-text
      :material-data-map
      :names
      :text-map
      @claim="(mail) => emit('claim', mail)"
      @delete-gift="(mail) => emit('deleteGift', mail)"
      @pin="(mail) => emit('pin', mail)"
    />
    <GameButton
      class="claim-all pill-disc"
      :disabled="!hasClaimable"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('claimAll')"
    >
      {{ gameText[GameTextKey.MailClaimAll] }}
    </GameButton>
    <GameButton
      class="delete-read pill-disc"
      :disabled="!hasDeletableMail"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="isConfirmingDeleteRead = true"
    >
      {{ gameText[GameTextKey.MailDeleteRead] }}
    </GameButton>
  </GameScreen>
</template>

<style scoped>
/* Measured off the English PC client's Mailbox at 1080 high, the screen's own pixels: the window is pillarboxed 96 pixels
   Each side, so the screen's left edge is the reference's x of 96 and a unit is a pixel of the reference */
.mail-screen {
  color: #fff;
}

/* The header's band, the world under it showing through, darker at the top left than the right */
.band {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 88);
  background: rgb(20 22 35 / 0.3);
}

.mailbox-glyph {
  position: absolute;
  top: calc(var(--unit) * 18);
  left: calc(var(--unit) * 39);
  width: calc(var(--unit) * 60);
  height: calc(var(--unit) * 44);
  fill: #d8c9a3;
}

.mailbox-tab,
.gift-box-tab {
  position: absolute;
  top: calc(var(--unit) * 28);
  height: calc(var(--unit) * 28);
  color: #d0bf9f;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.mailbox-tab {
  left: calc(var(--unit) * 129);
}

.gift-box-tab {
  left: calc(var(--unit) * 1077);
}

/* The count of the mails held, out of the mailbox's capacity, on the header's line beside the Gift Mail Box tab's place */
.mail-count {
  position: absolute;
  top: calc(var(--unit) * 28);
  left: calc(var(--unit) * 1319);
  margin: 0;
  color: #d0bf9f;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.mail-count span {
  color: #fff;
}

/* The close disc is 46 units across at the reference's place, where the shared close button's 58 at its right stands */
.close {
  top: calc(var(--unit) * 19);
  right: auto;
  left: calc(var(--unit) * 1633);
  width: calc(var(--unit) * 46);
  height: calc(var(--unit) * 46);
}

/* The mails down the left, each row a tab of its own, the selected one cream and the rest a dark glass */
.list {
  position: absolute;
  top: calc(var(--unit) * 107);
  left: calc(var(--unit) * 99);
  display: flex;
  width: calc(var(--unit) * 752);
  height: calc(var(--unit) * 308);
  flex-direction: column;
  gap: calc(var(--unit) * 10);
}

.notice {
  position: absolute;
  top: calc(var(--unit) * 1030);
  left: calc(var(--unit) * 106);
  margin: 0;
  font-size: calc(var(--unit) * 20);
}

.empty {
  position: absolute;
  top: calc(var(--unit) * 107);
  left: calc(var(--unit) * 99);
  width: calc(var(--unit) * 752);
  padding: calc(var(--unit) * 40);
  font-size: calc(var(--unit) * 20);
}

.empty-title {
  margin: 0 0 calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.mail-screen .claim-all,
.mail-screen .delete-read {
  top: calc(var(--unit) * 996);
  width: calc(var(--unit) * 215);
}

.mail-screen .claim-all {
  left: calc(var(--unit) * 106);
  padding-left: calc(var(--unit) * 63);
}

.mail-screen .delete-read {
  left: calc(var(--unit) * 352);
  padding-left: calc(var(--unit) * 50);
}
</style>

<style scoped src="../../../styles/mailScreen.css"></style>
<style scoped src="genshin-interface/styles/confirmDialog.css"></style>
