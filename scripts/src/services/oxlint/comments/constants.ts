export const MESSAGE =
  "A `//` line opens on a function or binding name capitalised into one that does not exist — `capitalized-comments` uppercases every line's first letter. Rewrap so the line opens on prose, or backtick the name; never lowercase it. See the formatting skill.";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const OPENING_CAPITALISED_WORD_REGEX: RegExp = /^\s*(?<word>[A-Z][\w$]*)/u;
// A name no prose word can be: a capital, digit, `_` or `$` past its first character. A single lowercase word
// (`result`, `value`) reads the same capitalised as the prose word does, so only this shape is decidable
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CODE_SHAPED_REGEX: RegExp = /^.[\w$]*[A-Z\d_$]/u;
// The naming skill's function and boolean prefixes, and the composable's `use`: a word opening on one and then a
// Capital is a function or binding name wherever it is declared, since no type or proper name is spelled that way
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const FUNCTION_PREFIX_REGEX: RegExp =
  /^(?:check|compute|count|create|delete|generate|get|has|is|on|read|search|set|store|update|use)[A-Z]/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SENTENCE_END_REGEX: RegExp = /[.!?:]\s*$/u;
// A directive either linter honours: the whole-file, next-line and same-line forms, never the `-enable` that closes one
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DIRECTIVE_REGEX: RegExp = /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?:\s|$)/u;
export const TRAILING_COMMENT_MESSAGE =
  "A `//` comment goes on its own line above the code it describes, never trailing after code on the same line. See the formatting skill.";
export const TERNARY_OPERATORS: ReadonlySet<string> = new Set([":", "?"]);
// The one directive that has to share its line: a same-line disable names the line it sits on
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SAME_LINE_DIRECTIVE_REGEX: RegExp = /^\s*(?:eslint|oxlint)-disable-line(?:\s|$)/u;
// A next-line disable of either linter, split at its rule list. `head` runs up to the list, `rules` is the list (absent
// For a bare directive, which names none), and `tail` is the ` -- reason` text, kept as written
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const NEXT_LINE_DIRECTIVE_REGEX: RegExp =
  /^(?<head>\s*(?<prefix>oxlint|eslint)-disable-next-line)(?<rules>\s[\s\S]*?)?(?<tail>\s--(?<reason>\s[\s\S]*)?)?$/u;
// A reason that only points at the reason above it, which the collapsed file-level directive already carries
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const BACK_REFERENCE_REASON_REGEX: RegExp = /^as above$/iu;
export const buildRepeatedDisableMessage = (prefix: string, rule: string): string =>
  `\`${rule}\` is disabled on several lines of this file. Collapse them into one file-level \`/* ${prefix}-disable ${rule} -- reason */\` at the top of the file, which the autofix writes. See the oxlint skill.`;
