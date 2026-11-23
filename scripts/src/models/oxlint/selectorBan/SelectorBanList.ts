import type { SelectorBan } from "#src/models/oxlint/selectorBan/SelectorBan";

// A list of selector bans with where they run, written beside the bans so a list states its own scope once
export interface SelectorBanList {
  bans: SelectorBan[];
  // The paths `files` matches that the bans still skip
  excludeFiles?: string[];
  // The scripts oxlint runs the bans over, by path, and none for a list only templates break
  files: string[];
  // Whether vize also runs the bans over every component's template
  isTemplate?: boolean;
}
