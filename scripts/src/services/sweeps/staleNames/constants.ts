import { CACHE_DIRECTORY, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The placeholders a rule's example uses (the `skill-authoring` skill, `references/what-belongs.md`) name nothing
export const PLACEHOLDER_WORDS: ReadonlySet<string> = new Set(["bar", "baz", "foo", "qux", "xxx"]);
// A camel hump, a snake underscore or a member dot — where one segment of a name ends and the next begins. An
// Acronym runs into the word after it without a hump (`aHTMLFoo`), so its last capital is a boundary of its own
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const NAME_SEGMENT_REGEX: RegExp = /(?<=[a-z\d])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|[._$]+/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const PLURAL_SUFFIX_REGEX: RegExp = /e?s$/u;
// A page cites a call as `name(args)` and a destructure as `{ a, b }`; the names judged are the callee and
// The bound identifiers, since the parens and braces belong to the sentence rather than to any name
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CALL_REGEX: RegExp = /^(?<callee>[^(]+)\(.*\)$/su;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DESTRUCTURE_REGEX: RegExp = /^\{(?<names>.*)\}$/su;
export const STORE_DIRECTORY: string = join(REPOSITORY_ROOT, "node_modules", ".pnpm");
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DECLARATION_REGEX: RegExp = /\.d\.[cm]?ts$/u;
export const SOURCE_WORD_CACHE_PATH: string = join(CACHE_DIRECTORY, "sourceWords.json");
