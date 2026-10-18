import type { MailSave } from "#src/models/mail/MailSave";

// The held mails in the order the mailbox lists them: pinned mail first, then each by its delivery, the newest first
export const sortMails = (mails: readonly MailSave[]): MailSave[] =>
  mails.toSorted(
    (first, second) =>
      Number(second.isPinned) - Number(first.isPinned) ||
      Temporal.Instant.compare(Temporal.Instant.from(second.deliveredAt), Temporal.Instant.from(first.deliveredAt)),
  );
