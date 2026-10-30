import { ARCHIVE_FOLDER, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";

export const OPENSPEC_DIRECTORY = "openspec";
export const OPENSPEC_SPEC_FILE = "/spec.md";

// Every spec in the tree, the live ones and the delta of each open change alike; `archive/` holds shipped deltas too.
export const OPENSPEC_SPEC_PATHSPEC: `${typeof OPENSPEC_DIRECTORY}/**${typeof OPENSPEC_SPEC_FILE}` = `${OPENSPEC_DIRECTORY}/**${OPENSPEC_SPEC_FILE}`;

// A date in prose is one of three forms: `2026-10-29`, `October 29, 2026` (a full or three-letter month) or `29 October 2026`.
// One that begins a path segment (after a `/`) is a name, not prose: an archived folder's name, a wiki page's title
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const DATED_PROSE_REGEX: RegExp =
  /(?<!\/)(?:\b(?:19|20)\d{2}-\d{2}-\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.? \d{1,2},? (?:19|20)\d{2}\b|\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.? (?:19|20)\d{2}\b)/u;
// A URL or a Markdown link's target is an address, taken out of its line first.
// The date in one (`https://.../2025-06-18/...`) names a place, not a date in prose.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const ADDRESS_REGEX: RegExp = /https?:\/\/\S+|\]\([^)]*\)/gu;
// A code span and a fenced block quote text rather than say it, so neither is prose: a fence opens and closes on a line of its own
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const CODE_SPAN_REGEX: RegExp = /`[^`]*`/gu;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const FENCE_REGEX: RegExp = /^\s*(?:```|~~~)/u;
// An archived delta is shipped history that nothing rewrites, so neither the citation rule nor the dated-prose scan reads it
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const ARCHIVED_DELTA_PREFIX: string = `${PROPOSALS_DIRECTORY}/${ARCHIVE_FOLDER}/`;
// Prose whose dates are the record itself: a shipped change's archive and the ledgers' dated rows
export const DATED_PROSE_SKIPPED_PREFIXES: readonly string[] = [ARCHIVED_DELTA_PREFIX, `${LEDGER_DIRECTORY}/`];
// Each package's changelog is written from the commits at release, so its headings carry release dates that only the release writes
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const CHANGELOG_REGEX: RegExp = /(?:^|\/)CHANGELOG\.md$/u;
