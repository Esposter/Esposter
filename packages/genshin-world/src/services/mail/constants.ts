import { GameDataset } from "#src/models/data/GameDataset";

// The most mails a player's mailbox holds, which the game's own mailbox capacity sets: the wiki's Mail page gives 1000
export const MAX_MAIL_COUNT = 1000;
// The mail table's index, which names each mail's row and the birthday mails' rows
export const MAIL_INDEX_KEY = `${GameDataset.Mail}/mail` as const;
