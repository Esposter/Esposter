import type { CitingPage } from "#src/models/shared/CitingPage";
import type { StaleNameFinding } from "#src/models/sweeps/staleNames/StaleNameFinding";

import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { checkIsPlaceholder } from "#src/services/sweeps/staleNames/checkIsPlaceholder";
import { getCitedNames } from "#src/services/sweeps/staleNames/getCitedNames";

const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*(?:\.[\w$]+)*$/u;
// A token that is a code name rather than a word that happens to be backticked: a camel hump, a member access or
// A SCREAMING_SNAKE constant. A lone capitalised word (`Manual`) or a lowercase one (`utils`) is prose as often
// As not, and reporting it would bury the names the scan exists for.
const CODE_NAME_REGEX = /[a-z][A-Z]|\.|^[A-Z][A-Z\d]*(?:_[A-Z\d]+)+$/u;
// A lone `X` standing in for a segment (`handleX`, `useXStore`) names nothing either
const PLACEHOLDER_SEGMENT_REGEX = /(?<=[a-z])X(?![a-z])/u;
// A page in these folders describes what does not exist by design — a rejected direction, a deferred idea, a
// Change not yet shipped — so every name in it resolves nowhere (the `openspec` skill, "The one status rule").
const UNSHIPPED_PAGE_REGEX = /\/(?:rejected|deferred|changes)\//u;

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
