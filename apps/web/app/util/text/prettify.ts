import type { SpaceWordBoundaries } from "#src/util/types/SpaceWordBoundaries";

import { normalizeString } from "@esposter/shared";

// Puts space between word boundaries:
// 1. lowercase + uppercase/digit
// 2. digit + lowercase/uppercase
export const prettify = <T extends string>(string: T) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the regex's word split happens at runtime, and SpaceWordBoundaries is the type-level split of T, which the compiler cannot evaluate against the regex
  normalizeString(string.replaceAll(/(?<=[a-z])(?=[A-Z0-9])|(?<=[0-9])(?=[a-zA-Z])/gu, " ")) as SpaceWordBoundaries<T>;
