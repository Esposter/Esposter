import type { VoiceCard } from "#src/models/VoiceCard";

import { SPINNER_CONTENT_PATH } from "#src/services/constants";
import { parseVoiceCard } from "#src/services/parseVoiceCard";
import { readFileSync } from "node:fs";

// The base Teyvat verbs and tips every character shows, authored in the card syntax
export const readSpinnerContent = (): VoiceCard => parseVoiceCard(readFileSync(SPINNER_CONTENT_PATH, "utf8"));
