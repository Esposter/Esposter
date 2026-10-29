import { ARCHIVE_FOLDER, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { LEDGER_DIRECTORY, SKILLS_DIRECTORY } from "#src/services/sweeps/constants";

export const OPENSPEC_DIRECTORY = "openspec";
export const OPENSPEC_SPEC_FILE = "/spec.md";

// Every spec in the tree, the live ones and the delta of each open change alike; `archive/` holds shipped deltas too.
export const OPENSPEC_SPEC_PATHSPEC: `${typeof OPENSPEC_DIRECTORY}/**${typeof OPENSPEC_SPEC_FILE}` = `${OPENSPEC_DIRECTORY}/**${OPENSPEC_SPEC_FILE}`;

// A date in prose is one of three forms: `2026-10-29`, `October 29, 2026` (a full or three-letter month) or `29 October 2026`.
// One that begins a path segment (after a `/`) is a name, not prose: an archived folder's name, a wiki page's title
export const DATED_PROSE_REGEX: RegExp =
  /(?<!\/)(?:\b(?:19|20)\d{2}-\d{2}-\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.? \d{1,2},? (?:19|20)\d{2}\b|\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.? (?:19|20)\d{2}\b)/u;
// A URL or a Markdown link's target is an address, taken out of its line first: the date in one (`https://.../2025-06-18/...`)
// names a place, not a date in prose
export const ADDRESS_REGEX: RegExp = /https?:\/\/\S+|\]\([^)]*\)/gu;
// A code span and a fenced block quote text rather than say it, so neither is prose: a fence opens and closes on a line of its own
export const CODE_SPAN_REGEX: RegExp = /`[^`]*`/gu;
export const FENCE_REGEX: RegExp = /^\s*(?:```|~~~)/u;
// Prose whose dates are the record itself: a shipped change's archive, the ledgers' dated rows, a vendored skill's publisher prose
export const DATED_PROSE_SKIPPED_PREFIXES: readonly string[] = [
  `${PROPOSALS_DIRECTORY}/${ARCHIVE_FOLDER}/`,
  `${LEDGER_DIRECTORY}/`,
  `${SKILLS_DIRECTORY}/pnpm-`,
  `${SKILLS_DIRECTORY}/vuetify0/`,
];
// Each package's changelog is written from the commits at release, so its headings carry release dates that only the release writes
export const CHANGELOG_REGEX: RegExp = /(?:^|\/)CHANGELOG\.md$/u;
