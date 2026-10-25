import { NAME_SEGMENT_REGEX, PLACEHOLDER_WORDS, PLURAL_SUFFIX_REGEX } from "#src/services/sweeps/staleNames/constants";

// A placeholder is a whole segment of the name rather than a run of letters inside one: `readFoos` is an example
// And `readFooter` is a name, which a substring test cannot tell apart — so it suppressed every real `Bare`,
// `Footer` and `Snackbar` in the trees this scans, and a stale name reading as English is the one nobody notices.
// A name whose placeholder segment is its last (`ResourceListFilterBar`) still reads as an example, since that is
// Exactly the shape `FooInputBar` has.
export const checkIsPlaceholder = (name: string): boolean =>
  name
    .split(NAME_SEGMENT_REGEX)
    .some((segment) => PLACEHOLDER_WORDS.has(segment.toLowerCase().replace(PLURAL_SUFFIX_REGEX, "")));
