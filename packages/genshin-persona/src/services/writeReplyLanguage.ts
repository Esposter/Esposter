import { REPLY_LANGUAGE_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeReplyLanguage = (language: string): void => {
  writeStateFile(REPLY_LANGUAGE_PATH, language);
};
