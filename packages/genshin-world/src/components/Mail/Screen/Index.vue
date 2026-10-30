<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";
import type { GameText } from "genshin-text";

import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { checkIsGiftBoxed } from "#src/services/mail/checkIsGiftBoxed";
import { checkIsSameHeldMail } from "#src/services/mail/checkIsSameHeldMail";
import { MAX_MAIL_COUNT } from "#src/services/mail/constants";
import { deleteReadMails } from "#src/services/mail/deleteReadMails";
import { getMailExpiry } from "#src/services/mail/getMailExpiry";
import { MailExpiryUnitGameTextKeyMap } from "#src/services/mail/MailExpiryUnitGameTextKeyMap";
import { sortMails } from "#src/services/mail/sortMails";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { ID_SEPARATOR } from "@esposter/shared";
import {
  CloseButton,
  CloseButtonMark,
  GameButton,
  GameButtonKind,
  GameScreen,
  ItemTile,
  OrnamentDivider,
} from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface MailEntry {
  mail: MailSave;
  row: Mail;
}

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
const hasClaimable = computed(() =>
  mails.some(({ id, isClaimed }) => !isClaimed && (mailRows.get(id)?.items.length ?? 0) > 0),
);
const hasDeletableMail = computed(() => deleteReadMails(mails, mailRows, birthdayMailIds).length < mails.length);
// A mail with items it has not paid out yet is marked in the list, as the game's red mark does
const checkIsClaimable = ({ mail, row }: MailEntry): boolean => !mail.isClaimed && row.items.length > 0;
// The date line's words either side of the date, since the game's line holds the date as {0} and the date is a NuxtTime
const dateLine = computed(() => gameText[GameTextKey.MailDetailDate].split("{0}"));
const mailGlyph = MenuFrameGlyphMap[MenuFrameIcon.Mail];
const selectTab = (isGift: boolean) => {
  isGiftBoxTab.value = isGift;
  isConfirmingDeleteGift.value = false;
};
// A currency's name is the game's, and an item's its material row's, read in the reader's language
const getItemName = (itemId: number): string => {
  const currency = getWalletCurrency(itemId);
  if (currency !== undefined) return gameText[CurrencyGameTextKeyMap[currency]];
  const materialData = materialDataMap.get(itemId);
  return materialData ? toItemDefinition(materialData, names).name : String(itemId);
};
// The tile of an item takes its rarity from its material row, and a currency, which has none, draws the lowest tile
const getItemRarity = (itemId: number): number => materialDataMap.get(itemId)?.rarity ?? 0;
// A mail in the Gift Mail Box is kept there and says so; any other mail shows its time left
const getStatusText = ({ mail, row }: MailEntry): string => {
  if (checkIsGiftBoxed(mail, row, birthdayMailIds)) return gameText[GameTextKey.MailGiftBox];
  const { count, unit } = getMailExpiry(mail.deliveredAt, row.expireDays, now);
  return fillGameTextValues(gameText[MailExpiryUnitGameTextKeyMap[unit]], count);
};
</script>

<template>
  <!-- The game's mailbox, which the Paimon menu opens: its header with the Mailbox and Gift Mail Box tabs and the close
       mark, its mails down the left, pinned first and each with its sender and time left, and the selected mail on the
       right with its text, its date and the items it gives, claimed once. Claim All claims every mail's items the bag can
       take, and Delete Read, once confirmed, removes every read mail with nothing left to claim. Delete on a Gift Mail Box
       mail, once its warning is confirmed, removes that one mail. A pin keeps a mail at the top of the list. The header's
       envelope and its help and folder marks, the list's star and person marks, the item icons and the button icons are
       the game's own art, which does not ship, so their places stay bare -->
  <GameScreen class="mail-screen">
    <span class="band" />
    <svg class="mailbox-glyph" aria-hidden="true" viewBox="0 0 72 56" preserveAspectRatio="none">
      <path v-for="path of mailGlyph.paths" :key="path" :d="path" />
    </svg>
    <GameButton
      class="mailbox-tab"
      tip=""
      :aria-pressed="!isGiftBoxTab"
      :kind="GameButtonKind.Plain"
      @click="selectTab(false)"
    >
      {{ gameText[GameTextKey.MailBox] }}
    </GameButton>
    <GameButton
      class="gift-box-tab"
      tip=""
      :aria-pressed="isGiftBoxTab"
      :kind="GameButtonKind.Plain"
      @click="selectTab(true)"
    >
      {{ gameText[GameTextKey.MailGiftBox] }}
    </GameButton>
    <CloseButton
      class="close"
      :label="gameText[GameTextKey.Back]"
      :mark="CloseButtonMark.Cross"
      @click="emit('close')"
    />
    <p v-if="isBagFull" class="notice">{{ gameText[GameTextKey.BagFull] }}</p>
    <p v-if="mails.length >= MAX_MAIL_COUNT" class="notice">{{ gameText[GameTextKey.MailFull] }}</p>
    <div class="list" role="tablist" aria-orientation="vertical">
      <button
        v-for="entry of visibleEntries"
        :key="getEntryKey(entry)"
        class="entry"
        role="tab"
        type="button"
        :aria-selected="selectedEntry !== undefined && checkIsSameHeldMail(entry.mail, selectedEntry.mail)"
        :data-read="entry.mail.isRead || undefined"
        @click="
          () => {
            selectedMail = entry.mail;
            isConfirmingDeleteGift = false;
            emit('read', entry.mail);
          }
        "
      >
        <span class="thumb" aria-hidden="true" />
        <span class="entry-title">{{ textMap[entry.row.titleTextId] }}</span>
        <span class="entry-sender">{{ textMap[entry.row.senderTextId] }}</span>
        <span class="entry-status">{{ getStatusText(entry) }}</span>
        <span v-if="!entry.mail.isRead" class="new" aria-hidden="true">{{ gameText[GameTextKey.New] }}</span>
        <span v-if="checkIsClaimable(entry)" class="unread" aria-hidden="true">!</span>
      </button>
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
      <GameButton class="cancel" tip="" :kind="GameButtonKind.Pill" @click="isConfirmingDeleteRead = false">
        {{ gameText[GameTextKey.Cancel] }}
      </GameButton>
      <GameButton
        class="confirm-button"
        tip=""
        :kind="GameButtonKind.Pill"
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
    <div v-if="selectedEntry" class="detail" role="tabpanel" :aria-label="textMap[selectedEntry.row.titleTextId]">
      <p class="detail-title">{{ textMap[selectedEntry.row.titleTextId] }}</p>
      <OrnamentDivider class="divider" />
      <p class="sender">
        {{ fillGameTextValues(gameText[GameTextKey.MailSender], textMap[selectedEntry.row.senderTextId] ?? "") }}
      </p>
      <p class="date">
        {{ dateLine[0]
        }}<NuxtTime
          :datetime="selectedEntry.mail.deliveredAt"
          year="numeric"
          month="2-digit"
          day="2-digit"
          hour="2-digit"
          minute="2-digit"
          hour-cycle="h23"
        />{{ dateLine[1] }}
      </p>
      <p class="body">{{ textMap[selectedEntry.row.contentTextId] }}</p>
      <div v-if="selectedEntry.row.items.length > 0" class="items">
        <ItemTile
          v-for="item of selectedEntry.row.items"
          :key="item.itemId"
          class="item"
          count-size="30cqh"
          :count="item.quantity"
          :rarity="getItemRarity(item.itemId)"
          role="img"
          :aria-label="fillGameTextValues(gameText[GameTextKey.ItemCount], getItemName(item.itemId), item.quantity)"
        />
      </div>
      <GameButton
        class="pin"
        tip=""
        :aria-label="gameText[selectedEntry.mail.isPinned ? GameTextKey.MailCancelStar : GameTextKey.MailStar]"
        :kind="GameButtonKind.Disc"
        @click="emit('pin', selectedEntry.mail)"
      />
      <p v-if="selectedEntry.mail.isClaimed && selectedEntry.row.items.length > 0" class="claimed">
        {{ gameText[GameTextKey.MailClaimed] }}
      </p>
      <GameButton
        v-else-if="selectedEntry.row.items.length > 0"
        class="claim"
        tip=""
        :kind="GameButtonKind.Pill"
        @click="emit('claim', selectedEntry.mail)"
      >
        {{ gameText[GameTextKey.MailClaim] }}
      </GameButton>
      <GameButton
        v-if="checkIsGiftBoxed(selectedEntry.mail, selectedEntry.row, birthdayMailIds) && !isConfirmingDeleteGift"
        class="delete-gift"
        tip=""
        :kind="GameButtonKind.Pill"
        @click="isConfirmingDeleteGift = true"
      >
        {{ gameText[GameTextKey.MailDelete] }}
      </GameButton>
      <section
        v-if="isConfirmingDeleteGift"
        class="confirm-gift"
        role="dialog"
        :aria-label="gameText[GameTextKey.MailGiftDeleteWarningTitle]"
      >
        <p class="confirm-title">{{ gameText[GameTextKey.MailGiftDeleteWarningTitle] }}</p>
        <p class="confirm-text">{{ gameText[GameTextKey.MailGiftDeleteWarning] }}</p>
        <GameButton class="cancel" tip="" :kind="GameButtonKind.Pill" @click="isConfirmingDeleteGift = false">
          {{ gameText[GameTextKey.Cancel] }}
        </GameButton>
        <GameButton
          class="confirm-button"
          tip=""
          :kind="GameButtonKind.Pill"
          @click="
            isConfirmingDeleteGift = false;
            emit('deleteGift', selectedEntry.mail);
          "
        >
          {{ gameText[GameTextKey.MailDelete] }}
        </GameButton>
      </section>
    </div>
    <GameButton
      class="claim-all"
      tip=""
      :disabled="!hasClaimable"
      :kind="GameButtonKind.Pill"
      @click="emit('claimAll')"
    >
      {{ gameText[GameTextKey.MailClaimAll] }}
    </GameButton>
    <GameButton
      class="delete-read"
      tip=""
      :disabled="!hasDeletableMail"
      :kind="GameButtonKind.Pill"
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
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.mailbox-tab {
  left: calc(var(--unit) * 129);
}

.gift-box-tab {
  left: calc(var(--unit) * 1077);
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
  background: rgb(236 226 213);
  color: #3b4354;
}

.entry:not([aria-selected="true"]) {
  width: calc(var(--unit) * 733);
  margin-left: calc(var(--unit) * 10);
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

/* The selected mail on the right: its title, a hairline with its diamonds, its sender and date, its text, its items */
.detail {
  position: absolute;
  top: calc(var(--unit) * 112);
  left: calc(var(--unit) * 915);
  width: calc(var(--unit) * 724);
  height: calc(var(--unit) * 900);
}

.detail-title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 32);
}

.divider {
  position: absolute;
  top: calc(var(--unit) * 32);
  left: calc(var(--unit) * -16);
  width: calc(var(--unit) * 755);
}

.sender,
.date,
.body {
  position: absolute;
  left: 0;
  margin: 0;
}

.sender,
.date {
  font-size: calc(var(--unit) * 19);
  line-height: calc(var(--unit) * 24);
}

.sender {
  top: calc(var(--unit) * 58);
}

.date {
  top: calc(var(--unit) * 91);
  color: rgb(220 220 220 / 0.75);
}

.body {
  top: calc(var(--unit) * 143);
  width: calc(var(--unit) * 724);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 29);
  white-space: pre-line;
}

.items {
  position: absolute;
  top: calc(var(--unit) * 770);
  left: calc(var(--unit) * 2);
  display: flex;
  gap: calc(var(--unit) * 10);
}

.item {
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
}

.claimed {
  margin: 0;
  font-size: calc(var(--unit) * 20);
}

/* The bottom row, Claim All and Delete Read on the left and the star and Claim on the right: the game's cream pills, which
   the shared button draws, placed here at the reference's own pixels */
.mail-screen .claim-all,
.mail-screen .delete-read,
.mail-screen .claim {
  position: absolute;
  display: flex;
  height: calc(var(--unit) * 54);
  align-items: center;
  justify-content: start;
  font-size: calc(var(--unit) * 24);
  text-align: start;
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

/* Inside the detail, which starts at 112 and 915, so the bottom row sits 884 down and 510 across it */
.mail-screen .claim {
  top: calc(var(--unit) * 884);
  left: calc(var(--unit) * 510);
  width: calc(var(--unit) * 216);
  padding-left: calc(var(--unit) * 85);
}

.mail-screen .pin {
  position: absolute;
  top: calc(var(--unit) * 884);
  left: calc(var(--unit) * 437);
  width: calc(var(--unit) * 44);
  height: calc(var(--unit) * 44);
}

.confirm-text {
  margin: 0 0 calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 24);
  white-space: pre-line;
}

.confirm-gift {
  margin-top: calc(var(--unit) * 24);
}

.confirm-title {
  margin: 0 0 calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 30);
}
</style>

<style scoped src="genshin-interface/styles/confirmDialog.css"></style>
