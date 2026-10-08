import type { Element } from "#src/models/Element";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";

import { GCG_DIE_FACES } from "#src/services/gcg/constants";
import { takeOne } from "@esposter/shared";

// Throws a number of dice from the seeded source, each face equally likely
export const rollGcgDice = (count: number, random: () => number): (Element | GcgDieFace)[] =>
  Array.from({ length: count }, () => takeOne(GCG_DIE_FACES, Math.floor(random() * GCG_DIE_FACES.length)));
