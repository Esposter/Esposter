import { STATE_DIRECTORY, VOICE_LOG_PATH } from "#src/services/constants";
import { appendFileSync, mkdirSync } from "node:fs";

// Why the synthesizer refused, with a diagnosis on disk where a hook's silence gives none
export const writeVoiceLog = (message: string): void => {
  mkdirSync(STATE_DIRECTORY, { recursive: true });
  appendFileSync(VOICE_LOG_PATH, `${Temporal.Now.instant().toString()} ${message}\n`);
};
