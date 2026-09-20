import { PIN_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

export const readPin = (): string => (existsSync(PIN_PATH) ? readFileSync(PIN_PATH, "utf8").trim() : "");
