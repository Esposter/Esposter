/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template
   literal would otherwise infer */
import { AGENT_DIRECTORY, KIBIBYTE } from "@esposter/configuration/constants";

/**
 * Where every ledger lives, relative to the repository root: the coverage sweep rewrites them, the prose scan sets them
 * aside as template-shaped, and the workspace suites hold their rows and scopes to the tree.
 */
export const LEDGER_DIRECTORY: string = `${AGENT_DIRECTORY}/ledgers`;
/**
 * Where every skill lives, relative to the repository root: one folder per skill holding its `SKILL.md` and its
 * `references/`, which is what the skill-docs checks, the prose scans and the derived skills ledger all walk.
 */
export const SKILLS_DIRECTORY: string = `${AGENT_DIRECTORY}/skills`;
/**
 * The skills installer's record of the third-party skills it copied into the skills directory, by name. Those skills
 * are vendored, not ours: their shape is their publisher's, so no scan holds them to this repository's conventions.
 */
export const SKILLS_LOCK_FILE = "skills-lock.json";
/**
 * The `.claude` symlink to `.agents`, which a scan walking the tree leaves out as a pathspec: reading it throws rather
 * than returning bytes, and testing every tree entry for a directory costs a `stat` each just to catch this one.
 */
export const CLAUDE_PATHSPEC_EXCLUDE = ":(exclude).claude";
/**
 * The NUL byte: a file holding one anywhere is binary by `git diff`'s own heuristic, so its bytes are data rather than
 * source.
 */
export const BINARY_BYTE = 0;
/**
 * How many bytes one read takes when a check scans a file for the NUL byte, so a binary file stops at the first chunk
 * holding one.
 */
export const CHUNK_BYTES: number = 64 * KIBIBYTE;
/**
 * A camel hump: a lowercase letter or digit meeting a capital. The one boundary both the name segment rule and a
 * component's path split on, so it is written once here and composed into each.
 */
export const CAMEL_HUMP_REGEX: RegExp = /(?<=[a-z\d])(?=[A-Z])/u;
/**
 * A camel hump, a snake underscore or a member dot — where one segment of a name ends and the next begins. An acronym
 * runs into the word after it without a hump (`aHTMLFoo`), so its last capital is a boundary of its own.
 */
export const NAME_SEGMENT_REGEX: RegExp = new RegExp(`${CAMEL_HUMP_REGEX.source}|(?<=[A-Z])(?=[A-Z][a-z])|[._$]+`, "u");
// The one partition every file-based question reads its cells from, one file per area, read by `readPartitionUnits`
export const LEDGER_AREA_DIRECTORY: string = `${LEDGER_DIRECTORY}/areas`;
