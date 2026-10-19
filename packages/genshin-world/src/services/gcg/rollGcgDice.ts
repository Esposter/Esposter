import type { Element } from "#src/models/Element";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";

import { GCG_DIE_FACES } from "#src/services/gcg/constants";
import { takeRandom } from "@esposter/shared";

// Throws a number of dice from the seeded source, each face equally likely
export const rollGcgDice = (count: number, random: () => number): (Element | GcgDieFace)[] =>
  Array.from({ length: count }, () => takeRandom(GCG_DIE_FACES, random));
