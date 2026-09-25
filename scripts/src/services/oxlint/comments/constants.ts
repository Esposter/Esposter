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
export const DIRECTIVE_REASON_MESSAGE =
  "A disable directive carries its reason after ` -- ` on the directive itself, so the next reader can tell a load-bearing exception from a stale one. See the oxlint skill.";
// A directive either linter honours: the whole-file, next-line and same-line forms, never the `-enable` that closes one
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DIRECTIVE_REGEX: RegExp = /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?:\s|$)/u;
// The ` -- ` separator both linters read as the start of a description, with something after it
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DIRECTIVE_REASON_REGEX: RegExp = /\s--\s+\S/u;
