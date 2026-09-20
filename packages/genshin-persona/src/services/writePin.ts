import { PIN_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writePin = (name: string): void => {
  writeStateFile(PIN_PATH, name);
};
