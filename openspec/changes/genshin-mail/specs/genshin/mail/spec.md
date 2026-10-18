## ADDED Requirements

### Requirement: The Mail screen lists the mails a player holds

The Mail screen SHALL list each mail the player holds with its sender and title, and opening a mail SHALL show its text and the items attached to it.

#### Scenario: The Mail screen lists the held mails

- **GIVEN** the player holds a mail
- **WHEN** the player opens the Mail screen
- **THEN** the mail is listed with its sender and title

#### Scenario: Opening a mail shows its text and attachments

- **GIVEN** the player holds a mail with an attached reward
- **WHEN** the player opens the mail
- **THEN** its text and the items it holds are shown

### Requirement: Claiming a mail gives its items once

A mail's attached items SHALL reach the bag and wallet once, when the player claims them, and a claimed mail SHALL NOT be claimed again.

#### Scenario: Claiming a mail gives its items once

- **GIVEN** the player holds a mail with an unclaimed reward
- **WHEN** the player claims the mail
- **THEN** its items are added to the bag and wallet, and the mail is marked claimed

#### Scenario: A claimed mail cannot be claimed again

- **GIVEN** the player has claimed a mail
- **WHEN** the player claims it again
- **THEN** no items are added

### Requirement: The mails a player holds survive a reload

The mails a player holds, with their claim and read state, SHALL be saved with the save and restored on load.

#### Scenario: A mail's claim is kept across a reload

- **GIVEN** the player has claimed a mail
- **WHEN** the save is reloaded
- **THEN** the mail is still marked claimed

#### Scenario: A save without its mails is refused

- **GIVEN** a save with no mail list
- **WHEN** the save is loaded
- **THEN** the save is refused

#### Scenario: A held mail whose row is gone is left off the list and kept in the save

- **GIVEN** the player holds a mail whose row is no longer in the mail table
- **WHEN** the mailbox loads
- **THEN** the other mails load, the mail is left off the Mail screen, and the save keeps it

### Requirement: Delete Read removes the read mail with nothing left to claim

The Mail screen SHALL offer Delete Read, which removes every read mail whose attachments are claimed or absent, and keeps every unread mail, every read mail still holding an unclaimed attachment, and every pinned mail.

#### Scenario: Delete Read removes a read mail whose attachment is claimed

- **GIVEN** the player holds a read mail whose attachment is claimed
- **WHEN** the player presses Delete Read
- **THEN** the mail is removed from the mailbox

#### Scenario: Delete Read keeps a read mail with an unclaimed attachment

- **GIVEN** the player holds a read mail with an attachment not yet claimed
- **WHEN** the player presses Delete Read
- **THEN** the mail is kept

#### Scenario: Delete Read keeps a pinned mail

- **GIVEN** the player holds a read pinned mail
- **WHEN** the player presses Delete Read
- **THEN** the mail is kept

#### Scenario: Delete Read asks the player to confirm first

- **GIVEN** the player holds a read mail that Delete Read would remove
- **WHEN** the player presses Delete Read
- **THEN** a confirm asks whether to delete all read mail and says that mail with unclaimed attachments is not deleted, and the mail stays until the player confirms

#### Scenario: Cancelling the confirm keeps the read mail

- **GIVEN** the player has pressed Delete Read and the confirm is open
- **WHEN** the player cancels it
- **THEN** the mail is kept

### Requirement: A pinned mail is listed first and kept from Delete Read, but still expires

The Mail screen SHALL let the player pin a held mail to the top of the list, and a pinned mail SHALL NOT be removed by Delete Read. A pinned mail SHALL still expire, since the wiki's Mail page says pinned mail "cannot be deleted quickly" and "can still expire" (https://genshin-impact.fandom.com/wiki/Mail).

#### Scenario: Pinning a mail lists it first

- **GIVEN** the player holds a mail that is not pinned
- **WHEN** the player pins it
- **THEN** the mail is listed above the unpinned mail, and its button offers to delete the pin

#### Scenario: Deleting a pin returns the mail to its place by delivery

- **GIVEN** the player has pinned a mail
- **WHEN** the player deletes its pin
- **THEN** the mail is listed by its delivery again

#### Scenario: Delete Read keeps a pinned mail

- **GIVEN** the player has pinned a read mail whose attachment is claimed
- **WHEN** the player presses Delete Read
- **THEN** the mail is kept

#### Scenario: A pinned mail still expires

- **GIVEN** the player has pinned a mail that is past its expiry
- **WHEN** the mailbox loads
- **THEN** the mail is deleted

### Requirement: The Gift Mail Box keeps the important mail once its rewards are claimed

The Mail screen SHALL move an important mail whose rewards are claimed into the Gift Mail Box, which lists it under its own tab apart from the Mailbox. The important mail is the birthday mail, and the mail the game's mail table flags, which the wiki calls important mail. A mail in the Gift Mail Box SHALL NOT expire and SHALL NOT be removed by Delete Read. The wiki's Mail page says birthday wishes "will be automatically transferred into the Gift Mail Box after the player has collected the rewards" and that mail in the box "will not be quick-deleted, and will not expire over time" (https://genshin-impact.fandom.com/wiki/Mail).

#### Scenario: A claimed birthday mail moves to the Gift Mail Box

- **GIVEN** the player holds a birthday mail
- **WHEN** the player claims its rewards
- **THEN** the mail is listed under the Gift Mail Box tab and no longer under the Mailbox tab

#### Scenario: A claimed mail the table flags is kept past its expiry

- **GIVEN** the player has a claimed mail that the mail table flags and that is past its expiry
- **WHEN** the mailbox loads
- **THEN** the mail is kept

#### Scenario: A claimed birthday mail is kept past its expiry

- **GIVEN** the player has a claimed birthday mail that is past its expiry
- **WHEN** the mailbox loads
- **THEN** the mail is kept

#### Scenario: Delete Read keeps a claimed birthday mail

- **GIVEN** the player has a read birthday mail whose rewards are claimed
- **WHEN** the player presses Delete Read
- **THEN** the mail is kept

### Requirement: A mail shows the date it was received

The Mail screen SHALL show, on an opened mail, the date the mail was received, in the reader's locale.

#### Scenario: An opened mail shows the date it was received

- **GIVEN** the player holds a mail delivered at a given moment
- **WHEN** the player opens the mail
- **THEN** its date line shows that date in the reader's locale
