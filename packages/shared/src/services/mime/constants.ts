// The media type a Content-Type value leads with, up to its parameters or the whitespace after it
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const MEDIA_TYPE_REGEXP: RegExp = /^\s*(?<mediaType>[^;\s]*)(?:;|\s|$)/u;
// A path's separators, which Windows paths use as well as posix ones
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const PATH_SEPARATOR_REGEXP: RegExp = /[/\\]/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const TEXT_MEDIA_TYPE_REGEXP: RegExp = /^text\//iu;
// A charset parameter by its own name, so a parameter that only contains the word leaves the default in place
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const CHARSET_PARAMETER_REGEXP: RegExp = /;\s*charset=/iu;
// The charset a text type gets when the dataset names none
// oxlint-disable-next-line unicorn/text-encoding-identifier-case -- `UTF-8` is the spelling a Content-Type header and the upstream report, and `utf8` would change the value
export const DEFAULT_TEXT_CHARSET = "UTF-8";

// The score of each part of a type, from mime-score: a higher score is the more official type
export const FacetScoreMap: ReadonlyMap<string, number> = new Map<string, number>([
  ["prs.", 100],
  ["x-", 200],
  ["x.", 300],
  ["vnd.", 400],
]);
export const DEFAULT_FACET_SCORE = 900;
export const SourceScoreMap: ReadonlyMap<string, number> = new Map<string, number>([
  ["nginx", 10],
  ["apache", 20],
  ["iana", 40],
]);
export const DEFAULT_SOURCE_SCORE = 30;
// Prefer application/xml over text/xml, font/woff over application/font-woff, and video/mp4 over audio/mp4 over application/mp4
export const TypeScoreMap: ReadonlyMap<string, number> = new Map<string, number>([
  ["application", 1],
  ["font", 2],
  ["audio", 2],
  ["video", 3],
]);
export const DEFAULT_TYPE_SCORE = 0;
