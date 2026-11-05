import type { PersonaCard } from "#src/models/PersonaCard";
import type { ReplyPiece } from "#src/models/ReplyPiece";
import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { TURNLESS_PIECE } from "#src/services/constants";
import { getCharacterReference } from "#src/services/getCharacterReference";
import { readVolume } from "#src/services/readVolume";

// What a hook sends to be spoken or warmed: the character the session speaks as, with the reference the card or
// The generated map names for them, the dub the `voice` verb chose, the piece's markdown, where in the reply it sits
// And the volume as set
export const getSpeechRequest = (
  type: SpeechRequest["type"],
  name: string,
  personaCard: PersonaCard | undefined,
  language: VoiceLanguage,
  markdown: string,
  piece: ReplyPiece = TURNLESS_PIECE,
): SpeechRequest => ({
  ...piece,
  language,
  markdown,
  name,
  stem: getCharacterReference(name, personaCard),
  type,
  volume: readVolume(),
});
