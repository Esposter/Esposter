# Tasks

## 1. The mail table

- [x] 1.1 Read the mail table into its rows with the sender, title, content, expiry and attached reward, joined to `readRewardMap`. Verify: tests named after the scenarios 'A mail reads its sender, title and expiry' and 'A mail with a reward reads its items' written first and seen failing.
- [x] 1.2 Skip a mail whose key the builder cannot name, and count those it skipped. Verify: a test named after the scenario 'A mail with an unnamed key is skipped' written first and seen failing.

## 2. The mails in the save

- [x] 2.1 Keep the mails a player holds in the save, required, with the claim and read state. Verify: tests named after the scenarios 'A save without its mails is refused' and 'A mail's claim is kept across a reload' written first and seen failing. The backfill for existing saves is the main session's, owed at 2.1's commit.
- [x] 2.2 Claim a mail's items once into the bag and wallet. Verify: tests named after the scenarios 'Claiming a mail gives its items once' and 'A claimed mail cannot be claimed again' written first and seen failing.
- [x] 2.3 Load the mailbox when a held mail's row is gone, leaving the mail off the list and in the save. Verify: a test named after the scenario 'A held mail whose row is gone is left off the list and kept in the save' written first and seen failing.

## 3. The Mail screen

- [x] 3.1 List the held mails on the Mail screen, and show a mail's text and attachments. Built provisionally from the wiki's Mail page; the parity loop's traced layout replaces it.
- [ ] 3.2 Deliver mails by the game's rules. The Traveler's birthday mail, the expiry and the Gift Mail Box's keeping are built provisionally; the PC export's client scripts confirm them.
- [ ] 3.3 Name the mails' text ids in `genshin-text`. The screen's keys are added and the mail text is built per language; the main session's text write fills the English and the other languages.
- [ ] 3.4 Delete Read removes the read mail with nothing left to claim, and keeps pinned mail. Verify: the tests named after the scenarios 'Delete Read removes a read mail whose attachment is claimed', 'Delete Read keeps a read mail with an unclaimed attachment' and 'Delete Read keeps a pinned mail' pass (`deleteReadMails.test.ts`, run). Blocker: the two Mail screen browser tests for the button are written and not run, since the browser suite is the main session's, and the 'UI_PLAYER_PROFILE_MAIL_DELETE' text is written by the main session.
