import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

// The held mails in the order the mailbox lists them: pinned mail first, then each by its delivery, the newest first
export const sortMails = (mails: readonly MailSave[], mailRows: ReadonlyMap<number, Mail>): MailSave[] => {
  const isPinned = (mailId: number): boolean => mailRows.get(mailId)?.isStar === true;
  return mails.toSorted(
    (first, second) =>
      Number(isPinned(second.id)) - Number(isPinned(first.id)) ||
      Temporal.Instant.compare(Temporal.Instant.from(second.deliveredAt), Temporal.Instant.from(first.deliveredAt)),
  );
};
