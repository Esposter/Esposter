<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";
import type { GameText } from "genshin-text";

import MenuListScreenDetail from "#src/components/Menu/ListScreen/Detail/Index.vue";
import MenuListScreen from "#src/components/Menu/ListScreen/Index.vue";
import MenuListScreenTab from "#src/components/Menu/ListScreen/Tab/Index.vue";
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
import { ID_SEPARATOR } from "@esposter/shared";
import { GameButton, GameButtonKind } from "genshin-interface";
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
// The date line's words either side of the date, since the game's line holds the date as {0} and the date is a NuxtTime
const dateLine = computed(() => gameText[GameTextKey.MailDetailDate].split("{0}"));
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
// A mail in the Gift Mail Box is kept there and says so; any other mail shows its time left
const getStatusText = ({ mail, row }: MailEntry): string => {
  if (checkIsGiftBoxed(mail, row, birthdayMailIds)) return gameText[GameTextKey.MailGiftBox];
  const { count, unit } = getMailExpiry(mail.deliveredAt, row.expireDays, now);
  return fillGameTextValues(gameText[MailExpiryUnitGameTextKeyMap[unit]], count);
};
</script>

<template>
  <!-- The game's mailbox, which the Paimon menu opens: its mails down the left, pinned first and each with its sender and
       time left, and the selected mail on the right with its text and the items it gives, claimed once. Claim All claims
       every mail's items the bag can take, and Delete Read, once confirmed, removes every read mail with nothing left to claim. Delete on a
       Gift Mail Box mail, once its warning is confirmed, removes that one mail. A pin keeps a mail at the top of the list, and the Gift Mail Box, the tab beside the Mailbox, lists the birthday mail kept there. Its date is the date it was received. Not yet built:
       the look the English client draws -->
  <MenuListScreen :game-text :title="gameText[GameTextKey.Mail]" @close="emit('close')">
    <template #tabs>
      <GameButton
        class="mailbox-tab"
        tip=""
        :aria-pressed="!isGiftBoxTab"
        :kind="GameButtonKind.Pill"
        @click="selectTab(false)"
      >
        {{ gameText[GameTextKey.MailBox] }}
      </GameButton>
      <GameButton
        class="gift-box-tab"
        tip=""
        :aria-pressed="isGiftBoxTab"
        :kind="GameButtonKind.Pill"
        @click="selectTab(true)"
      >
        {{ gameText[GameTextKey.MailGiftBox] }}
      </GameButton>
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
    </template>
    <template #list>
      <p v-if="isBagFull" class="notice">{{ gameText[GameTextKey.BagFull] }}</p>
      <p v-if="mails.length >= MAX_MAIL_COUNT" class="notice">{{ gameText[GameTextKey.MailFull] }}</p>
      <div v-if="visibleEntries.length > 0" class="list" role="tablist" aria-orientation="vertical">
        <MenuListScreenTab
          v-for="entry of visibleEntries"
          :key="getEntryKey(entry)"
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
          <span class="title">{{ textMap[entry.row.titleTextId] }}</span>
          <span class="sender">{{ textMap[entry.row.senderTextId] }}</span>
          <span class="status">{{ getStatusText(entry) }}</span>
        </MenuListScreenTab>
      </div>
      <div v-else class="empty">
        <p class="title">{{ gameText[GameTextKey.MailNoMail] }}</p>
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
    </template>
    <template #detail>
      <MenuListScreenDetail v-if="selectedEntry" :aria-label="textMap[selectedEntry.row.titleTextId]">
        <p class="title">{{ textMap[selectedEntry.row.titleTextId] }}</p>
        <p class="sender">
          {{ fillGameTextValues(gameText[GameTextKey.MailSender], textMap[selectedEntry.row.senderTextId] ?? "") }}
        </p>
        <p class="date">
          {{ dateLine[0]
          }}<NuxtTime :datetime="selectedEntry.mail.deliveredAt" date-style="medium" time-style="short" />{{
            dateLine[1]
          }}
        </p>
        <p class="body">{{ textMap[selectedEntry.row.contentTextId] }}</p>
        <ul v-if="selectedEntry.row.items.length > 0" class="items">
          <li v-for="item of selectedEntry.row.items" :key="item.itemId">
            {{ fillGameTextValues(gameText[GameTextKey.ItemCount], getItemName(item.itemId), item.quantity) }}
          </li>
        </ul>
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
        <GameButton class="pin" tip="" :kind="GameButtonKind.Pill" @click="emit('pin', selectedEntry.mail)">
          {{ gameText[selectedEntry.mail.isPinned ? GameTextKey.MailCancelStar : GameTextKey.MailStar] }}
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
      </MenuListScreenDetail>
    </template>
  </MenuListScreen>
</template>

<style scoped>
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

/* Provisional: the mail's marks are not yet traced off the game, so they take the list screen's unit and the quest
   screen's type sizes */
.title {
  margin: 0;
  font-size: calc(var(--unit) * 30);
}

.sender,
.date,
.status,
.notice,
.claimed {
  margin: 0;
  font-size: calc(var(--unit) * 20);
}

.body {
  margin: calc(var(--unit) * 20) 0;
  font-size: calc(var(--unit) * 24);
  white-space: pre-line;
}

.items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.empty {
  padding: calc(var(--unit) * 40);
}

.claim-all,
.claim,
.pin {
  margin-top: calc(var(--unit) * 20);
}
</style>

<style scoped src="genshin-interface/styles/confirmDialog.css"></style>
