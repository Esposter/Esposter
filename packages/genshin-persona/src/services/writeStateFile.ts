import { STATE_DIRECTORY } from "#src/services/constants";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

// Every write into the state directory creates it first: the first session on a machine is the one with nothing
// There. The content goes to a pid-suffixed temp sibling and is renamed over the target, so a session killed
// Part-way through a write leaves the previous file rather than half of this one, and two sessions writing at once
// Cannot truncate each other. Rename is atomic within a filesystem and the temp is in the same directory to keep it
// There. Every reader here survives a file damaged some other way — a line short, a field short — except the roster
// Cache, whose half-written JSON would throw in every later session rather than being rebuilt. A temp left by a
// Kill between the two calls is left where it is: reclaiming one would mean a sweep deleting a name a session
// Still writing under is about to rename, which costs that session its character to spare the directory a file
export const writeStateFile = (path: string, content: string): void => {
  mkdirSync(STATE_DIRECTORY, { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, content);
  renameSync(temporaryPath, path);
};
