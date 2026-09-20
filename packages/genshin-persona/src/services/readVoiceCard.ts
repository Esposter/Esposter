import { CARD_EXTENSION, CARDS_DIRECTORY } from "#src/services/constants";
import { getCardSlug } from "#src/services/getCardSlug";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const readVoiceCard = (name: string): string => {
  const cardPath = join(CARDS_DIRECTORY, `${getCardSlug(name)}${CARD_EXTENSION}`);
  return existsSync(cardPath) ? readFileSync(cardPath, "utf8").trim() : "";
};
