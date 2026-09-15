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
const PLACEHOLDER_REGEX = /[Ff]oo|[Bb]ar|[Bb]az|[Qq]ux|[Xx]xx|(?<=[a-z])X(?![a-z])/u;
// A page in these folders describes what does not exist by design — a rejected direction, a deferred idea, a
// Design not yet shipped — so every name in it is expected to resolve nowhere (the `docs` skill, "location carries status")
const UNSHIPPED_PAGE_REGEX = /\/(?:rejected|deferred|proposals)\//u;

// Every code name a page cites that the source tree no longer holds. A member access (`Foo.bar`) is judged by its
// Segments, since the source writes `foo.bar` and the page writes the type's name in front of it.
export const getStaleNames = (pages: CitingPage[], sourceNames: ReadonlySet<string>): StaleNameFinding[] =>
  pages
    .filter(({ path }) => !UNSHIPPED_PAGE_REGEX.test(path))
    .flatMap(({ path, text }) =>
      [...new Set(getBacktickedTokens(text))]
        .filter(
          (name) =>
            IDENTIFIER_REGEX.test(name) &&
            CODE_NAME_REGEX.test(name) &&
            !PLACEHOLDER_REGEX.test(name) &&
            !sourceNames.has(name) &&
            !name.split(".").every((segment) => sourceNames.has(segment)),
        )
        .map((name) => ({ name, path })),
    );
