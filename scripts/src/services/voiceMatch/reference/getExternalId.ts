import { EXTERNAL_PATH_EXTENSION, EXTERNAL_PATH_SEPARATOR } from "#src/services/voiceMatch/constants";
import { getFnv1Hash64 } from "#src/services/voiceMatch/reference/getFnv1Hash64";

const FORWARD_SLASH_REGEX = /\//gu;

// The id a game-data line's clip is stored under in one track: the game data records the stem with forward slashes
// And mixed case, and Wwise hashed it lowercased under the track's folder with backslashes
export const getExternalId = (voicefile: string, track: string): bigint => {
  const stem = voicefile.toLowerCase().replaceAll(FORWARD_SLASH_REGEX, EXTERNAL_PATH_SEPARATOR);
  return getFnv1Hash64(`${track.toLowerCase()}${EXTERNAL_PATH_SEPARATOR}${stem}${EXTERNAL_PATH_EXTENSION}`);
};
