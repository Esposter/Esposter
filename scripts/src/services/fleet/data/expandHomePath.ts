import { homedir } from "node:os";
import { join } from "node:path";

// A local path with a leading ~/ resolved to this machine's home directory
export const expandHomePath = (path: string): string => (path.startsWith("~/") ? join(homedir(), path.slice(2)) : path);
