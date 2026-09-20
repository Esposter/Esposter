import { STATE_DIRECTORY } from "#src/services/constants";
import { mkdirSync, writeFileSync } from "node:fs";

// Every write into the state directory creates it first: the first session on a machine is the one with nothing there
export const writeStateFile = (path: string, content: string): void => {
  mkdirSync(STATE_DIRECTORY, { recursive: true });
  writeFileSync(path, content);
};
