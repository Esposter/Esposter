import { VOLUME_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// "" when no volume was set, which leaves the voice at the service's default
export const readVolume = (): string => (existsSync(VOLUME_PATH) ? readFileSync(VOLUME_PATH, "utf8").trim() : "");
