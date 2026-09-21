import type { CitingPage } from "#src/models/citations/CitingPage";
import type { StaleNameFinding } from "#src/models/sweeps/staleNames/StaleNameFinding";

import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";

const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*(?:\.[\w$]+)*$/u;
// A token that is a code name rather than a word that happens to be backticked: a camel hump, a member access or
// A SCREAMING_SNAKE constant. A lone capitalised word (`Manual`) or a lowercase one (`utils`) is prose as often
// As not, and reporting it would bury the names the scan exists for.
const CODE_NAME_REGEX = /[a-z][A-Z]|\.|^[A-Z][A-Z\d]*(?:_[A-Z\d]+)+$/u;
// The placeholders a rule's example uses (the `skill-authoring` skill, `references/what-belongs.md`) name nothing —
// Nor does a lone `X` standing in for a segment (`handleX`, `useXStore`)
const PLACEHOLDER_WORDS = new Set(["bar", "baz", "foo", "qux", "xxx"]);
const PLACEHOLDER_SEGMENT_REGEX = /(?<=[a-z])X(?![a-z])/u;
// A camel hump, a snake underscore or a member dot — where one segment of a name ends and the next begins. An
// Acronym runs into the word after it without a hump (`aHTMLFoo`), so its last capital is a boundary of its own
const NAME_SEGMENT_REGEX = /(?<=[a-z\d])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|[._$]+/u;
const PLURAL_SUFFIX_REGEX = /e?s$/u;
// A page in these folders describes what does not exist by design — a rejected direction, a deferred idea, a
// Design not yet shipped — so every name in it is expected to resolve nowhere (the `docs` skill, "location carries
// Status")
const UNSHIPPED_PAGE_REGEX = /\/(?:rejected|deferred|proposals)\//u;
// A page cites a call as `name(args)` and a destructure as `{ a, b }`; the names judged are the callee and
// The bound identifiers, since the parens and braces belong to the sentence rather than to any name
const CALL_REGEX = /^(?<callee>[^(]+)\(.*\)$/su;
const DESTRUCTURE_REGEX = /^\{(?<names>.*)\}$/su;

const getCitedNames = (token: string): string[] => {
  const names = DESTRUCTURE_REGEX.exec(token)?.groups?.names;
  if (names === undefined) return [CALL_REGEX.exec(token)?.groups?.callee ?? token];
  else return names.split(",").map((name) => name.trim());
};

// A placeholder is a whole segment of the name rather than a run of letters inside one: `readFoos` is an example
// And `readFooter` is a name, which a substring test cannot tell apart — so it suppressed every real `Bare`,
// `Footer` and `Snackbar` in the trees this scans, and a stale name reading as English is the one nobody notices.
// A name whose placeholder segment is its last (`ResourceListFilterBar`) still reads as an example, since that is
// Exactly the shape `FooInputBar` has.
const checkIsPlaceholder = (name: string): boolean =>
  name
    .split(NAME_SEGMENT_REGEX)
    .some((segment) => PLACEHOLDER_WORDS.has(segment.toLowerCase().replace(PLURAL_SUFFIX_REGEX, "")));

// Every code name a page cites that the source tree no longer holds. A member access (`Foo.bar`) is judged by its
// Segments, since the source writes `foo.bar` and the page writes the type's name in front of it.
export const getStaleNames = (pages: CitingPage[], sourceNames: ReadonlySet<string>): StaleNameFinding[] =>
  pages
    .filter(({ path }) => !UNSHIPPED_PAGE_REGEX.test(path))
    .flatMap(({ path, text }) =>
      [...new Set(getBacktickedTokens(text).flatMap((token) => getCitedNames(token)))]
        .filter(
          (name) =>
            IDENTIFIER_REGEX.test(name) &&
            CODE_NAME_REGEX.test(name) &&
            !checkIsPlaceholder(name) &&
            !PLACEHOLDER_SEGMENT_REGEX.test(name) &&
            !sourceNames.has(name) &&
            !name.split(".").every((segment) => sourceNames.has(segment)),
        )
        .map((name) => ({ name, path })),
    );
