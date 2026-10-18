import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";
import type { TextChunk } from "#src/models/data/TextChunk";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { GameLanguage } from "genshin-text";
import type { Ref } from "vue";

import { GameDataset } from "#src/models/data/GameDataset";
import { birthdayMailRowsSchema } from "#src/models/mail/MailData";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { claimAllMails } from "#src/services/mail/claimAllMails";
import { claimMail } from "#src/services/mail/claimMail";
import { deliverBirthdayMail } from "#src/services/mail/deliverBirthdayMail";
import { readMailRows } from "#src/services/mail/readMailRows";
import { readMailText } from "#src/services/mail/readMailText";
import { removeExpiredMails } from "#src/services/mail/removeExpiredMails";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The mailbox's rows and texts, read as the world starts, with the Traveler's birthday mail delivered and the expired mails
// Removed as the clock stands then. A claim takes a mail's items into the bag and wallet once, and a claim the bag cannot
// Take whole leaves the mail held and says so
export const useWorldMail = ({
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  language,
  materialDataMap,
  names,
  savedMails,
  savedTravelerBirthday,
  setInventory,
  setWallet,
  wallet,
}: {
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  language: GameLanguage;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  savedMails: MailSave[];
  savedTravelerBirthday: TravelerBirthdaySave | undefined;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const mails = shallowRef<MailSave[]>(savedMails);
  const mailData = shallowRef<{
    birthdayMailIds: ReadonlySet<number>;
    mailRows: ReadonlyMap<number, Mail>;
    textMap: TextChunk;
  }>();
  const isBagFull = shallowRef(false);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(async () => {
    const indexKey = `${GameDataset.Mail}/mail` as const;
    const birthdayMailRows = await readGameDataEntry(
      gameDataBaseUrl,
      indexKey,
      "birthdayMails",
      birthdayMailRowsSchema,
    );
    const birthdayMailIds = new Set(birthdayMailRows.map(({ mailId }) => mailId));
    const mailIds = new Set([...savedMails.map(({ id }) => id), ...birthdayMailIds]);
    const [mailRows, textMap] = await Promise.all([
      readMailRows(gameDataBaseUrl, [...mailIds]),
      readMailText(gameDataBaseUrl, language),
    ]);
    const now = getWorldNow();
    const held = removeExpiredMails(savedMails, mailRows, birthdayMailIds, now);
    mails.value = deliverBirthdayMail(held, savedTravelerBirthday, birthdayMailRows, now);
    mailData.value = { birthdayMailIds, mailRows, textMap };
  }).match(
    () => {},
    (error) => {
      console.error(error);
    },
  );

  const applyMailboxState = (nextState: { inventory: Inventory; mails: MailSave[]; wallet: Wallet }) => {
    setInventory(nextState.inventory);
    setWallet(nextState.wallet);
    mails.value = nextState.mails;
  };
  const claim = (mailId: number) => {
    const mailRow = mailData.value?.mailRows.get(mailId);
    if (!mailRow) return;
    const nextState = claimMail(
      { inventory: inventory.value, mails: mails.value, wallet: wallet.value },
      mailRow,
      names,
      materialDataMap,
    );
    if (!nextState) {
      isBagFull.value = mails.value.some(({ id, isClaimed }) => id === mailId && !isClaimed);
      return;
    }
    isBagFull.value = false;
    applyMailboxState(nextState);
  };
  const claimAll = () => {
    const mailRows = mailData.value?.mailRows;
    if (!mailRows) return;
    const nextState = claimAllMails(
      { inventory: inventory.value, mails: mails.value, wallet: wallet.value },
      mailRows,
      names,
      materialDataMap,
    );
    isBagFull.value = nextState.mails.some(({ isClaimed }) => !isClaimed);
    applyMailboxState(nextState);
  };
  return { claim, claimAll, isBagFull, mailData, mails };
};
