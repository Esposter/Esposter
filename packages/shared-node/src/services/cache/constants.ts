import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The one folder every checkout on a machine shares for what it downloads. A cache under a checkout's `node_modules` is
// Empty in every new worktree and every ephemeral run, so it is fetched again each time; each consumer derives its own
// Folder from this root
export const CACHE_ROOT: string = join(homedir(), SITE_NAME, "cache");
// Objects named by the hex SHA-256 of their bytes, whichever source served them, so every consumer of the same content
// Shares one copy without agreeing on anything but the hash
export const CONTENT_CACHE_DIRECTORY: string = join(CACHE_ROOT, "content");
