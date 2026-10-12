import { capitalize } from "@esposter/shared";

const SCREAMING_SNAKE_CASE_REGEX = /^[A-Z0-9_]+$/u;
const SNAKE_CASE_WORD_START_REGEX = /_(?<letter>[a-z0-9])/gu;

// A name of a kit's record from the names a module reads a value by, outermost first: each camel-cased, a constant's
// Words joined, and the parts run together
export const toKitModuleName = (parts: readonly string[]): string =>
  parts
    .map((part, index) => {
      const camelCasePart = SCREAMING_SNAKE_CASE_REGEX.test(part)
        ? part.toLowerCase().replaceAll(SNAKE_CASE_WORD_START_REGEX, (_match, letter: string) => letter.toUpperCase())
        : part;
      return index === 0 ? camelCasePart : capitalize(camelCasePart);
    })
    .join("");
