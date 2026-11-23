import { GameDataset } from "#src/models/data/GameDataset";

// The most mails a save holds: the app's own storage ceiling, which the save schema bounds its mails by, so a crafted
// Save cannot grow the blob without limit. The game's cap is the mail dataset's maxCount, which readMailMaxCount reads,
// And the mailbox counts its mails against that. It is under this ceiling, so every mailbox the game allows is stored
export const MAX_STORED_MAIL_COUNT = 1000;
// The mail table's index, which names each mail's row and the birthday mails' rows
export const MAIL_INDEX_KEY = `${GameDataset.Mail}/mail` as const;
// The hours a day holds, which a mail's expiry in days is counted in
export const HOURS_PER_DAY = 24;
