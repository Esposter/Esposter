import type { SpaceWordBoundaries } from "@/util/types/SpaceWordBoundaries";

import { normalizeString } from "@esposter/shared";

// Puts space between word boundaries:
// 1. lowercase + uppercase/digit
// 2. digit + lowercase/uppercase
export const prettify = <T extends string>(string: T) =>
  normalizeString(string.replaceAll(/(?<=[a-z])(?=[A-Z0-9])|(?<=[0-9])(?=[a-zA-Z])/gu, " ")) as SpaceWordBoundaries<T>;
