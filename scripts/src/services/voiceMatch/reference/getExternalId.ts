import {
  EXTERNAL_PATH_EXTENSION,
  EXTERNAL_PATH_LANGUAGE,
  EXTERNAL_PATH_SEPARATOR,
} from "#src/services/voiceMatch/constants";
import { getFnv1Hash64 } from "#src/services/voiceMatch/reference/getFnv1Hash64";

const FORWARD_SLASH_REGEX = /\//gu;

// The id a game-data line's clip is stored under: the game data records the stem with forward slashes and mixed case,
// And Wwise hashed it lowercased under the language folder with backslashes
export const getExternalId = (voicefile: string): bigint => {
  const stem = voicefile.toLowerCase().replaceAll(FORWARD_SLASH_REGEX, EXTERNAL_PATH_SEPARATOR);
  return getFnv1Hash64(`${EXTERNAL_PATH_LANGUAGE}${EXTERNAL_PATH_SEPARATOR}${stem}${EXTERNAL_PATH_EXTENSION}`);
};
