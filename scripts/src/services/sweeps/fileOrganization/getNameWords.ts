import {
  ABSTRACT_PREFIX,
  COMPOSABLE_PREFIX,
  WORD_BOUNDARY_REGEX,
} from "#src/services/sweeps/fileOrganization/constants";

// An identifier as the lowercase words it is spelled from — `selectAppUserInMessageSchema` and
// `SERIALIZABLE_VALUE_MAX_LENGTH` alike — with a composable's `use` dropped, since its options and emit types
// Carry the name without the verb, and an abstract class's `A` dropped, since its schema and concrete twin do not
// Carry it either
export const getNameWords = (name: string): string[] => {
  const words = name
    .split(WORD_BOUNDARY_REGEX)
    .filter((word) => word.length > 0)
    .map((word) => word.toLowerCase());
  return words.length > 1 && (words[0] === COMPOSABLE_PREFIX || words[0] === ABSTRACT_PREFIX) ? words.slice(1) : words;
};
