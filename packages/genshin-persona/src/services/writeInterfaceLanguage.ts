import { INTERFACE_LANGUAGE_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeInterfaceLanguage = (language: string): void => {
  writeStateFile(INTERFACE_LANGUAGE_PATH, language);
};
