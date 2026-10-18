# Mail

## Why

Mail is how the game hands a player rewards and messages: a letter from a character or the game, with its text, the items attached to it, and a date it expires. The menu already has a Mail entry, but its screen is a placeholder, so a player cannot read a letter or claim what it holds.

## What Changes

- The Mail screen lists the mails the player holds, each with its sender and title.
- Opening a mail shows its text and the items attached to it, and a claim gives the items to the bag and wallet once.
- A mail the player has not claimed is kept until its expiry, and a claimed one is kept as read.
- The mails a player holds are saved with the save, so they survive a reload.

## Capabilities

- **genshin/mail** (new)

## Waiting on

- Which mails a player receives, and when: the game's delivery rules sit in its scripts, which only the PC export holds. Until then the screen lists the mails the save holds, and no mail is delivered.
- The mails' text, sender and title, as game text ids: the main session writes those strings into `genshin-text`.
- The screen's layout, which the parity loop traces from the game's own still.

## Impact

Adds the mail reader to the asset builders, the mail list to the save with its backfill, and the screen's contents. The save's shape changes, so its backfill is the main session's.
