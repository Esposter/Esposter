import { PIN_PATH } from "#src/services/constants";
import { rmSync } from "node:fs";

export const deletePin = (): void => {
  rmSync(PIN_PATH, { force: true });
};
