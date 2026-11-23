/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` needs the annotation the regex would infer */
import { CACHE_DIRECTORY } from "#src/services/shared/constants";
import { join } from "node:path";

// The placeholders a rule's example uses (the `skill-authoring` skill, `references/what-belongs.md`) name nothing
export const PLACEHOLDER_WORDS: ReadonlySet<string> = new Set(["bar", "baz", "foo", "qux", "xxx"]);
export const PLURAL_SUFFIX_REGEX: RegExp = /e?s$/u;
// A page cites a call as `name(args)` and a destructure as `{ a, b }`; the names judged are the callee and
// The bound identifiers, since the parens and braces belong to the sentence rather than to any name
export const CALL_REGEX: RegExp = /^(?<callee>[^(]+)\(.*\)$/su;
export const DESTRUCTURE_REGEX: RegExp = /^\{(?<names>.*)\}$/su;
export const DECLARATION_REGEX: RegExp = /\.d\.[cm]?ts$/u;
// Text a name can be declared or used in. Markdown is left out on purpose: the pages are what the scan judges,
// And a stale name cited on two of them would otherwise vouch for itself.
export const SOURCE_EXTENSION_REGEX: RegExp = /\.(?:[cm]?[jt]sx?|vue|json|ya?ml|toml|css|html|sh|ps1)$/u;
export const SOURCE_WORD_CACHE_PATH: string = join(CACHE_DIRECTORY, "sourceWords.json");
// Bumped whenever what a word is changes or a cache's shape does: a cache written before comments were blanked holds
// The words of comments, which vouch for the names they cite, so it is read as empty rather than trusted. A cache
// Written before the code words were kept lacks each entry's `codeWords`, and one written before the entries stopped
// Keeping `words` still holds them, so each is read as empty too
export const SOURCE_WORD_CACHE_VERSION: number = 4;
