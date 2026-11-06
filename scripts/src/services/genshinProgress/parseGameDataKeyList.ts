import type { GenshinLockKeys } from "#src/models/genshinProgress/GenshinLockKeys";

import {
  GAME_DATA_INDEX_KEYS_NAME,
  GAME_DATA_KEYS_NAME,
  RENDERED_CONSTANT_CLOSING,
} from "#src/services/gameData/constants";
import { renderConstantOpening } from "#src/services/gameData/renderConstantOpening";

// A key is the quoted path a leaf takes after its colon, never a quoted property name such as `"nod-krai": {`
const KEY_REGEX = /: "(?<key>[^"]+)"/gu;

// The body of one key constant, the text between the line that opens it and the line that closes it, as `renderConstant`
// Writes them
const readLeaves = (text: string, name: string): string[] => {
  const escapedOpening = RegExp.escape(renderConstantOpening(name));
  const escapedClosing = RegExp.escape(RENDERED_CONSTANT_CLOSING);
  const pattern = new RegExp(`${escapedOpening}\\n(?<body>[\\s\\S]*?)\\n${escapedClosing}`, "u");
  const body = pattern.exec(text)?.groups?.body ?? "";
  return Array.from(body.matchAll(KEY_REGEX), ({ groups }) => groups?.key ?? "");
};

// The keys the world's key list names, the datasets read whole and the indexes read by id
export const parseGameDataKeyList = (text: string): GenshinLockKeys => ({
  indexes: readLeaves(text, GAME_DATA_INDEX_KEYS_NAME),
  objects: readLeaves(text, GAME_DATA_KEYS_NAME),
});
