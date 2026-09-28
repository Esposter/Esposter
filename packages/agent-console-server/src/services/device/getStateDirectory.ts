import { STATE_DIRECTORY_NAME } from "#src/services/device/constants";
import { homedir } from "node:os";
import { join } from "node:path";

export const getStateDirectory = (): string => join(homedir(), STATE_DIRECTORY_NAME);
