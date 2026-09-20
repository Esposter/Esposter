import { MUTED_PATH } from "#src/services/constants";
import { existsSync } from "node:fs";

export const checkIsMuted = (): boolean => existsSync(MUTED_PATH);
