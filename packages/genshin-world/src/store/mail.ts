import type { TextChunk } from "#src/models/data/TextChunk";
import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";
import type { MailSave } from "#src/models/mail/MailSave";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { checkIsSameHeldMail } from "#src/services/mail/checkIsSameHeldMail";
import { claimAllMails } from "#src/services/mail/claimAllMails";
import { claimMail } from "#src/services/mail/claimMail";
import { deleteGiftMail } from "#src/services/mail/deleteGiftMail";
import { deleteReadMails } from "#src/services/mail/deleteReadMails";
import { deliverBirthdayMail } from "#src/services/mail/deliverBirthdayMail";
import { readBirthdayMailRows } from "#src/services/mail/readBirthdayMailRows";
import { readMailRows } from "#src/services/mail/readMailRows";
import { readMailText } from "#src/services/mail/readMailText";
import { removeExpiredMails } from "#src/services/mail/removeExpiredMails";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, noop } from "@esposter/shared";
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

// The mailbox's rows and texts, read as the world starts, with the Traveler's birthday mail delivered and the expired mails
// Removed as the clock stands then. A claim takes a mail's items into the bag and wallet once, and a claim the bag cannot
// Take whole leaves the mail held and says so. The session starts it after the session store and stops it as it unmounts
export const useWorldMailStore = defineStore("world/mail", () => {
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow, setInventory, setWallet } = worldSessionStore;
  const mails = shallowRef<MailSave[]>([]);
  const mailData = shallowRef<{
    birthdayMailIds: ReadonlySet<number>;
    mailRows: ReadonlyMap<number, Mail>;
    textMap: TextChunk;
  }>();
  const isBagFull = ref(false);
  // The load in flight, which a stop retires, so a load the session outlived returns without reading the session it stopped
  let loading: symbol | undefined;

  const start = (savedMails: MailSave[], savedTravelerBirthday?: TravelerBirthdaySave) => {
    mails.value = savedMails;
    // The session's game data and language are taken before the first await, while the session is still there to read
    const { gameDataBaseUrl, language } = worldSessionStore;
    const load = Symbol("mail load");
    loading = load;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(async () => {
      const birthdayMailRows = await readBirthdayMailRows(gameDataBaseUrl);
      const birthdayMailIds = new Set(birthdayMailRows.map(({ mailId }) => mailId));
      const mailIds = new Set([...savedMails.map(({ id }) => id), ...birthdayMailIds]);
      const [mailRows, textMap] = await Promise.all([
        readMailRows(gameDataBaseUrl, [...mailIds]),
        readMailText(gameDataBaseUrl, language),
      ]);
      if (loading !== load) return;
      const now = getWorldNow();
      const held = removeExpiredMails(savedMails, mailRows, birthdayMailIds, now);
      mails.value = deliverBirthdayMail(held, savedTravelerBirthday, birthdayMailRows, now);
      mailData.value = { birthdayMailIds, mailRows, textMap };
    }).match(noop, (error) => {
      if (loading === load) console.error(error);
    });
  };
  const stop = () => {
    loading = undefined;
    mails.value = [];
    mailData.value = undefined;
    isBagFull.value = false;
  };
  const applyMailboxState = (nextState: MailboxState) => {
    setInventory(nextState.inventory);
    setWallet(nextState.wallet);
    mails.value = nextState.mails;
  };
  const claim = (held: MailSave) => {
    const mailRow = mailData.value?.mailRows.get(held.id);
    if (!mailRow) return;
    const nextState = claimMail(
      { inventory: worldSessionStore.inventory, mails: mails.value, wallet: worldSessionStore.wallet },
      held,
      mailRow,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    if (!nextState) {
      isBagFull.value = mails.value.some((mail) => checkIsSameHeldMail(mail, held) && !mail.isClaimed);
      return;
    }
    isBagFull.value = false;
    applyMailboxState(nextState);
  };
  const claimAll = () => {
    const mailRows = mailData.value?.mailRows;
    if (!mailRows) return;
    const nextState = claimAllMails(
      { inventory: worldSessionStore.inventory, mails: mails.value, wallet: worldSessionStore.wallet },
      mailRows,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    isBagFull.value = nextState.mails.some(({ isClaimed }) => !isClaimed);
    applyMailboxState(nextState);
  };
  const deleteGift = (held: MailSave) => {
    if (!mailData.value) return;
    const { birthdayMailIds, mailRows } = mailData.value;
    mails.value = deleteGiftMail(mails.value, mailRows, birthdayMailIds, held);
  };
  const deleteRead = () => {
    if (!mailData.value) return;
    const { birthdayMailIds, mailRows } = mailData.value;
    mails.value = deleteReadMails(mails.value, mailRows, birthdayMailIds);
  };
  const markMailRead = (held: MailSave) => {
    mails.value = mails.value.map((mail) =>
      checkIsSameHeldMail(mail, held) && !mail.isRead ? { ...mail, isRead: true } : mail,
    );
  };
  const toggleMailPin = (held: MailSave) => {
    mails.value = mails.value.map((mail) =>
      checkIsSameHeldMail(mail, held) ? { ...mail, isPinned: !mail.isPinned } : mail,
    );
  };

  return {
    claim,
    claimAll,
    deleteGift,
    deleteRead,
    isBagFull,
    mailData,
    mails,
    markMailRead,
    start,
    stop,
    toggleMailPin,
  };
});
